import { fromLonLat, toLonLat } from "ol/proj";
import { openskyApi, cancelPendingRequest } from "src/api/opensky.api";
import { Feature, Map as OLMap } from "ol";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import type { AircraftState, BBox } from "src/api/opensky.api";
import { invalidateClickedFeature } from "./event";

// requestIdleCallback polyfill（Safari 兼容）
const scheduleIdle = (callback: () => void) => {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
};

// 渐进注入批次大小
const CHUNK_SIZE = 200;

// 数据模式类型
export type DataMode = "cache" | "remote";

// Cached layer refs to avoid repeated find() lookups
let planeLayerRef: VectorLayer<VectorSource> | null = null;
let pathLayerRef: VectorLayer<VectorSource> | null = null;

// 数据模式状态
let currentMode: DataMode = "cache";
// 缓存数据是否已注入（cache 模式首次加载用）
let cacheDataInjected = false;
// 远程数据是否有有效内容（用于 remote 失败时回退）
let hasCacheData = false;

// 外部注入的 cache 数据（懒加载 JSON）
let cacheDataFromFile: AircraftState[] | null = null;
// 标记 injectCacheData 因数据未就绪而被跳过，待 setCacheData 后补注入
let pendingInjection = false;
const REMOTE_UPDATE_INTERVAL = 45000;
const remoteAircraftData: AircraftState[] = [];

/**
 * 根据 AircraftState 创建 Feature（复用逻辑）
 */
const createFeatureFromState = (state: AircraftState): Feature => {
  const [projX, projY] = fromLonLat([state.lon, state.lat]);
  return new Feature({
    geometry: new Point([projX, projY]),
    ...state,
    isHovered: 0,
    isSelected: 0,
    projX,
    projY,
    currentX: projX,
    currentY: projY,
    lastTickTime: performance.now(),
  });
};

// featureMap：icao24 → feature 的快速查找
const featureMap = new Map<string, Feature>();

/**
 * 获取飞机图层引用
 */
export const getPlaneLayer = (): VectorLayer<VectorSource> | null => planeLayerRef;

/**
 * 获取路径图层引用
 */
export const getPathLayer = (): VectorLayer<VectorSource> | null => pathLayerRef;

/**
 * 设置图层引用
 */
export const setLayerRefs = (plane: VectorLayer<VectorSource>, path: VectorLayer<VectorSource>) => {
  planeLayerRef = plane;
  pathLayerRef = path;
};

/**
 * 设置 cache 数据（从外部 fetch 注入）
 */
export const setCacheData = (data: AircraftState[]) => {
  cacheDataFromFile = data;
  if (pendingInjection) {
    pendingInjection = false;
    injectCacheData();
  }
};

/**
 * 懒加载缓存 JSON 数据
 */
export const loadCacheData = async (): Promise<AircraftState[]> => {
  const response = await fetch('/cache/map-state.json');
  return response.json();
};

/**
 * 注入缓存数据到飞机图层（cache 模式首次加载）
 */
export const injectCacheData = () => {
  if (!cacheDataFromFile) {
    pendingInjection = true;
    return;
  }
  if (!planeLayerRef) return;
  const planeSource = planeLayerRef.getSource();
  if (!planeSource) return;

  // 如果 source 中已有 features（initMap 中 createPlaneLayersFromCache 已注入），
  // 不再清空重建，避免飞机闪烁/消失
  const existingFeatures = planeSource.getFeatures();
  if (existingFeatures.length > 0 && cacheDataInjected) {
    return;
  }
  // 清空已有 features 防止重复注入
  planeSource.clear();
  featureMap.clear();

  // 渐进注入：第一批同步 200 架，后续分帧注入
  const allData = cacheDataFromFile;
  const firstBatch = allData.slice(0, CHUNK_SIZE);
  for (const state of firstBatch) {
    const feature = createFeatureFromState(state);
    planeSource.addFeature(feature);
    featureMap.set(state.icao24, feature);
  }

  // 后续分帧注入
  if (allData.length > CHUNK_SIZE) {
    let offset = CHUNK_SIZE;
    const injectChunk = () => {
      if (!planeLayerRef || !cacheDataFromFile) return; // 已销毁则停止
      const chunk = allData.slice(offset, offset + CHUNK_SIZE);
      for (const state of chunk) {
        const feature = createFeatureFromState(state);
        planeSource.addFeature(feature);
        featureMap.set(state.icao24, feature);
      }
      offset += CHUNK_SIZE;
      if (offset < allData.length) scheduleIdle(injectChunk);
      else { hasCacheData = true; cacheDataInjected = true; }
    };
    scheduleIdle(injectChunk);
  } else {
    hasCacheData = true;
    cacheDataInjected = true;
  }
};

/**
 * 获取当前视图的 BBox
*/
const getViewBBox = (map: OLMap): BBox | undefined => {
  const view = map.getView();
  const zoom = view.getZoom() ?? 1;
  if (zoom < 3) return undefined;

  const extent = view.calculateExtent(map.getSize());
  const bottomLeft = toLonLat([extent[0], extent[1]]);
  const topRight = toLonLat([extent[2], extent[3]]);

  return {
    lamin: bottomLeft[1],
    lamax: topRight[1],
    lomin: bottomLeft[0],
    lomax: topRight[0],
  };
};

/**
 * 检查并触发远程数据更新（给 update.ts 的 tick 调用）
 */
export const tickRemoteUpdate = (map: OLMap, now: number, lastRemoteUpdateTime: { value: number }): void => {
  if (currentMode !== "remote") return;
  if (now - lastRemoteUpdateTime.value < REMOTE_UPDATE_INTERVAL) return;

  lastRemoteUpdateTime.value = now;
  const bbox = getViewBBox(map);
  openskyApi
    .getStates(bbox)
    .then((res) => {
      remoteAircraftData.length = 0;
      remoteAircraftData.push(...res.states);
    })
    .catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      const isNightMode = error instanceof Error && error.message === "night_mode";
      if (isNightMode) {
        console.log("夜间模式：回退到本地缓存数据");
      } else {
        console.error("Failed to fetch remote aircraft data:", error);
      }
      // 夜间模式或远程失败时，回退到 cache 模式
      if (hasCacheData) {
        currentMode = "cache";
      }
    });
};

/**
 * 手动刷新远程数据
 */
export const refreshStates = async (map: OLMap) => {
  cancelPendingRequest();
  remoteAircraftData.length = 0;
  try {
    const bbox = getViewBBox(map);
    const res = await openskyApi.getStates(bbox);
    remoteAircraftData.push(...res.states);
    if (remoteAircraftData.length) {
      applyRemoteState();
    }
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    const isNightMode = error instanceof Error && error.message === "night_mode";
    if (isNightMode) {
      console.log("夜间模式：回退到本地缓存数据");
      if (hasCacheData) currentMode = "cache";
    } else {
      console.error("Failed to refresh states:", error);
    }
  }
};

/**
 * 应用远程数据到图层（diff 算法）
 */
export const applyRemoteState = () => {
  // 无远程数据时不做任何操作（cache 模式下 remoteAircraftData 为空，避免误删飞机 feature）
  if (remoteAircraftData.length === 0) return;
  if (!planeLayerRef) return;
  const airplaneSource = planeLayerRef.getSource();
  if (!airplaneSource) return;

  const remoteStateMap = remoteAircraftData.reduce((acc, state) => {
    acc.set(state.icao24, state);
    return acc;
  }, new Map<string, AircraftState>());

  for (const feature of airplaneSource.getFeatures()) {
    const icao24 = feature.get("icao24");
    const newState = remoteStateMap.get(icao24);
    if (newState) {
      const [projX, projY] = fromLonLat([newState.lon, newState.lat]);
      feature.setProperties({
        icao24: newState.icao24,
        lon: newState.lon,
        lat: newState.lat,
        heading: newState.heading !== null ? newState.heading : null,
        velocity: newState.velocity,
        timePosition: newState.timePosition,
        altitude: newState.altitude,
        projX,
        projY,
      });
      // 新数据到达时重置增量基准位置
      feature.set("currentX", projX);
      feature.set("currentY", projY);
      feature.set("lastTickTime", performance.now());
      featureMap.set(newState.icao24, feature);
      remoteStateMap.delete(icao24);
    } else {
      invalidateClickedFeature(feature);
      featureMap.delete(icao24);
      airplaneSource.removeFeature(feature);
    }
  }

  for (const [, newState] of remoteStateMap) {
    const feature = createFeatureFromState(newState);
    featureMap.set(newState.icao24, feature);
    airplaneSource.addFeature(feature);
  }

  remoteAircraftData.length = 0;
};

/**
 * 切换数据模式
 */
export const switchDataMode = (mode: DataMode) => {
  currentMode = mode;
  if (mode === "cache") {
    // 切回 cache 模式：清空远程数据，注入缓存数据
    remoteAircraftData.length = 0;
    injectCacheData();
  }
};

/**
 * 获取当前数据模式
 */
export const getDataMode = (): DataMode => currentMode;

/**
 * 重置数据模块状态（destroyMap 时调用）
 */
export const resetDataState = () => {
  cacheDataInjected = false;
  currentMode = "cache";
  planeLayerRef = null;
  pathLayerRef = null;
  featureMap.clear();
  hasCacheData = false;
  remoteAircraftData.length = 0;
  cacheDataFromFile = null;
  pendingInjection = false;
};
