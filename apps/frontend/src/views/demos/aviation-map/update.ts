import { Map as OLMap } from "ol";
import { degToRad } from "src/utils/geo";
import { containsExtent, buffer as bufferExtent } from "ol/extent";
import { SimpleGeometry } from "ol/geom";
import { cancelPendingRequest } from "src/api/opensky.api";
import {
  tickRemoteUpdate,
  applyRemoteState,
  getPlaneLayer,
  getPathLayer,
  setLayerRefs,
  resetDataState,
  injectCacheData,
  getDataMode,
} from "./dataSource";

// rAf 相关状态
let rafId: number | null = null;
let lastFrameTime = 0;
let lastUpdateTime = 0;
const lastRemoteUpdateTime = { value: 0 };
// 缩放动画暂停标志
let isPaused = false;
// 暂停开始时间，用于恢复时批量补偿
let pauseStartTime = 0;
// 视口 buffer（像素），避免边缘飞机频繁显隐
const VIEW_BUFFER_RATIO = 0.2;

/**
 * 根据 zoom 级别获取帧间隔（ms）
 */
const getInterval = (zoom: number) => {
  const z = Math.floor(zoom);
  const intervals: Record<number, number> = {
    1: 5000, 2: 4000, 3: 3000, 4: 2000,
    5: 1000, 6: 500, 7: 200, 8: 100,
  };
  return intervals[z] || 100;
};

/**
 * 计算当前视口 extent（带 buffer）
 */
const getVisibleExtent = (map: OLMap) => {
  const size = map.getSize();
  if (!size) return undefined;
  const extent = map.getView().calculateExtent(size);
  const buffer = (size[0] * VIEW_BUFFER_RATIO) / 2;
  return bufferExtent(extent, buffer);
};

/**
 * 核心 rAf 动画循环
 */
const tick = (map: OLMap) => {
  // 缩放动画期间暂停位置更新，仅维持 rAf 链
  if (isPaused) {
    rafId = requestAnimationFrame((timestamp) => {
      lastFrameTime = timestamp;
      tick(map);
    });
    return;
  }

  const now = performance.now();

  // 远程数据更新判断（仅在 remote 模式下执行）
  tickRemoteUpdate(map, now, lastRemoteUpdateTime);

  // 根据 zoom 级别间隔更新飞机位置
  const zoom = map.getView().getZoom() ?? 1;
  const interval = getInterval(zoom);

  if (now - lastUpdateTime >= interval) {
    updateLayers(map);
    lastUpdateTime = now;
  }

  // 继续下一帧
  rafId = requestAnimationFrame((timestamp) => {
    lastFrameTime = timestamp;
    tick(map);
  });
};

/**
 * 更新图层：飞机位置 + 路径
 */
const updateLayers = (map: OLMap) => {
  const planeLayer = getPlaneLayer();
  if (!planeLayer) return;
  const source = planeLayer.getSource();
  if (!source) return;

  // 如果有待处理的远程数据，先应用
  applyRemoteState();

  updatePlaneLayers(map);
  updatePathLayer();
};

/**
 * 逐帧增量更新飞机位置（基于速度和朝向）
 * 优化：仅更新视口可见的 planes，视野外跳过
 */
const updatePlaneLayers = (map: OLMap) => {
  const planeLayer = getPlaneLayer();
  if (!planeLayer) return;
  const source = planeLayer.getSource();
  if (!source) return;
  const features = source.getFeatures();
  const now = performance.now();
  const visibleExtent = getVisibleExtent(map);

  for (const feature of features) {
    // 视锥体裁剪：不可见的飞机跳过几何更新
    if (visibleExtent) {
      const projX = feature.get("projX") as number | undefined;
      const projY = feature.get("projY") as number | undefined;
      if (projX != null && projY != null) {
        if (!containsExtent(visibleExtent, [projX, projY, projX, projY])) {
          continue;
        }
      }
    }

    const heading = feature.get("heading") as number | null ?? 0;
    const velocity = feature.get("velocity") as number | null ?? 0;
    if (!velocity || !heading) continue;
    // 获取上一帧位置（增量计算的基础）
    const prevX = feature.get("currentX") as number | undefined;
    const prevY = feature.get("currentY") as number | undefined;
    const lastTick = feature.get("lastTickTime") as number | undefined ?? now;
    if (prevX == null || prevY == null) continue;
    // 计算时间差（秒），首次或异常值做保护
    const deltaTime = Math.min((now - lastTick) / 1000, 5);
    if (deltaTime <= 0) continue;
    // heading 为度数，转弧度用于三角计算
    const headingRad = degToRad(heading);
    // 增量位移 = 速度 × 时间差 × 方向
    const d = velocity * deltaTime;
    const newX = prevX + d * Math.sin(headingRad);
    const newY = prevY + d * Math.cos(headingRad);
    // 更新 feature 状态
    feature.set("currentX", newX);
    feature.set("currentY", newY);
    feature.set("lastTickTime", now);
    // 更新几何坐标
    const geometry = feature.getGeometry() as SimpleGeometry | undefined;
    if (geometry) {
      geometry.setCoordinates([newX, newY]);
    }
  }
};

/**
 * 更新路径图层：路径终点跟随飞机当前位置
 */
const updatePathLayer = () => {
  const pathLayer = getPathLayer();
  const planeLayer = getPlaneLayer();
  if (!pathLayer || !planeLayer) return;
  const source = pathLayer.getSource();
  if (!source) return;
  const features = source.getFeatures();
  for (const feature of features) {
    const geometry = feature.getGeometry() as SimpleGeometry | undefined;
    if (!geometry) continue;
    const pathPoints = geometry.getCoordinates() as number[][];
    const icao24 = feature.get("icao24") as string;
    // 从飞机图层找到对应 feature
    const planeSource = planeLayer.getSource();
    if (!planeSource) continue;
    const planeFeatures = planeSource.getFeatures();
    const planeFeature = planeFeatures.find((f) => f.get("icao24") === icao24);
    if (!planeFeature) continue;
    const planeGeometry = planeFeature.getGeometry() as SimpleGeometry | undefined;
    if (!planeGeometry) continue;
    const curPoint = planeGeometry.getCoordinates() as number[];
    pathPoints[pathPoints.length - 1] = curPoint;
    geometry.setCoordinates([...pathPoints]);
  }
};

/**
 * 暂停动画循环（缩放动画期间调用）
 */
export const pauseUpdate = () => {
  if (isPaused) return;
  isPaused = true;
  pauseStartTime = performance.now();
};

/**
 * 恢复动画循环，批量补偿暂停期间的位置
 */
export const resumeUpdate = () => {
  if (!isPaused) return;
  isPaused = false;
  const now = performance.now();
  const pausedDuration = now - pauseStartTime;
  pauseStartTime = 0;

  // 如果暂停时间较短（< 100ms），无需补偿
  if (pausedDuration < 100) return;

  // 批量补偿：对所有可见 planes 按暂停时长做一次位置更新
  const planeLayer = getPlaneLayer();
  if (!planeLayer) return;
  const source = planeLayer.getSource();
  if (!source) return;

  const features = source.getFeatures();
  for (const feature of features) {
    const heading = feature.get("heading") as number | null ?? 0;
    const velocity = feature.get("velocity") as number | null ?? 0;
    if (!velocity || !heading) continue;
    const prevX = feature.get("currentX") as number | undefined;
    const prevY = feature.get("currentY") as number | undefined;
    if (prevX == null || prevY == null) continue;
    const deltaTime = Math.min(pausedDuration / 1000, 10);
    const headingRad = degToRad(heading);
    const d = velocity * deltaTime;
    const newX = prevX + d * Math.sin(headingRad);
    const newY = prevY + d * Math.cos(headingRad);
    feature.set("currentX", newX);
    feature.set("currentY", newY);
    feature.set("lastTickTime", now);
    const geometry = feature.getGeometry() as SimpleGeometry | undefined;
    if (geometry) {
      geometry.setCoordinates([newX, newY]);
    }
  }
};

/**
 * 启动 rAf 动画循环
 */
export const startUpdate = (map: OLMap) => {
  // 如果是首次启动且当前是 cache 模式，先注入缓存数据
  if (getDataMode() === "cache") {
    injectCacheData();
  }

  if (rafId !== null) return; // 已在运行
  isPaused = false;
  lastRemoteUpdateTime.value = performance.now();
  rafId = requestAnimationFrame((timestamp) => {
    lastFrameTime = timestamp;
    tick(map);
  });
};

/**
 * 停止 rAf 动画循环并重置模块状态
 */
export const stopUpdate = () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  isPaused = false;
  pauseStartTime = 0;
  // Cancel any pending API request
  cancelPendingRequest();
  // 重置模块级状态，确保二次初始化正常
  resetDataState();
  lastFrameTime = 0;
  lastUpdateTime = 0;
  lastRemoteUpdateTime.value = 0;
};

// 保留 setLayerRefs 导出供 index.ts 使用
export { setLayerRefs };
