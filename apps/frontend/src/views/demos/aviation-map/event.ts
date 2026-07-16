import { Feature, Map as OLMap } from "ol";
import { showToast } from "./index";
import { LineString, SimpleGeometry } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { openskyApi } from "src/api/opensky.api";
import type { TracksResponse } from "@ianportfolio/shared";
import BaseLayer from "ol/layer/Base";
import { LAYER_NAMES } from "./constants";
import { getPlaneLayer, getPathLayer, getDataMode } from "./dataSource";
import { generateSyntheticTrack } from "./trackUtils";
import { pauseUpdate, resumeUpdate } from "./update";

let isTrackLoading = false;
let trackDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastClickedFeatureRef: Feature | null = null;

// Frontend track cache (5 min TTL)
const trackCache = new Map<string, { data: TracksResponse; time: number }>();
const TRACK_CACHE_TTL = 300000; // 5 minutes

export const invalidateClickedFeature = (feature: Feature) => {
  if (lastClickedFeatureRef === feature) {
    lastClickedFeatureRef.set("isSelected", 0);
    lastClickedFeatureRef = null;
  }
};

const attachMoveEvents = (map: OLMap) => {
  let lastHoveredFeature: Feature | null = null;
  const container = map.getTargetElement();
  let lastMoveTime = 0;
  const MOVE_THROTTLE = 50; // 50ms throttle
  (map as any).on("pointermove", (e: any) => {
    if (e.dragging) return;
    const now = Date.now();
    if (now - lastMoveTime < MOVE_THROTTLE) return;
    lastMoveTime = now;
    if (lastHoveredFeature) {
      lastHoveredFeature.set("isHovered", 0);
      lastHoveredFeature = null;
    }
    const features = map.getFeaturesAtPixel(e.pixel, {
      layerFilter: (layer: BaseLayer) => layer.get("name") === "planes",
      hitTolerance: 3,
    });
    const hoveredFeature = features[0] as Feature | undefined;
    if (hoveredFeature) {
      lastHoveredFeature = hoveredFeature;
      lastHoveredFeature.set("isHovered", 1);
      container.style.cursor = "pointer";
    } else {
      container.style.cursor = "default";
    }
  });
};

const attachClickEvents = (map: OLMap) => {
  (map as any).on("click", (e: any) => {
    // 清除之前的选中状态和轨迹
    if (lastClickedFeatureRef) {
      lastClickedFeatureRef.set("isSelected", 0);
      lastClickedFeatureRef = null;
      removePath();
    }
    // 清除待执行的轨迹加载定时器，防止点击空白区后仍加载轨迹
    if (trackDebounceTimer) {
      clearTimeout(trackDebounceTimer);
      trackDebounceTimer = null;
    }
    isTrackLoading = false;

    const features = map.getFeaturesAtPixel(e.pixel, {
      layerFilter: (layer: BaseLayer) => layer.get("name") === LAYER_NAMES.PLANES,
      hitTolerance: 3,
    });
    const clickedFeature = features[0] as Feature | undefined;
    if (clickedFeature) {
      lastClickedFeatureRef = clickedFeature;
      lastClickedFeatureRef.set("isSelected", 1);
      // 先获取轨迹数据，更新飞机位置后再统一移动地图（避免闪烁）
      addPath(clickedFeature, map);
    }
  });
  /**
   * 暂停更新并移动到指定中心点
   */
  const moveMapTo = (center: number[]) => {
    pauseUpdate();
    map.getView().animate({ center, duration: 500 }, { zoom: 12, duration: 500 });
  };

  const addPath = (planeFeature: Feature, map: OLMap) => {
    if (isTrackLoading) return;
    if (trackDebounceTimer) {
      clearTimeout(trackDebounceTimer);
      trackDebounceTimer = null;
    }
    trackDebounceTimer = setTimeout(async () => {
      isTrackLoading = true;
      try {
        let lineCoords: number[][];

        if (getDataMode() === "cache") {
          // cache 模式：用本地数据模拟轨迹，不调用任何接口
          const geometry = planeFeature.getGeometry() as SimpleGeometry | undefined;
          if (!geometry) return;
          const [curX, curY] = geometry.getCoordinates() as number[];
          const heading = (planeFeature.get("heading") as number | null) ?? 0;
          const velocity = (planeFeature.get("velocity") as number | null) ?? 0;
          lineCoords = generateSyntheticTrack(curX, curY, heading, velocity);
          // cache 模式：画完轨迹后直接移动地图
          const pathLayer = getPathLayer();
          if (pathLayer) {
            pathLayer.getSource()?.addFeature(
              new Feature({ geometry: new LineString(lineCoords), icao24: planeFeature.get("icao24") as string }),
            );
          }
          moveMapTo([curX, curY]);
        } else {
          // remote 模式：从真实接口获取轨迹
          const icao24 = planeFeature.get("icao24") as string;
          const now = Date.now();
          const cached = trackCache.get(icao24);
          let pathData: TracksResponse;
          if (cached && (now - cached.time) < TRACK_CACHE_TTL) {
            pathData = cached.data;
          } else {
            const response = await openskyApi.getTracks(icao24);
            pathData = response;
            trackCache.set(icao24, { data: response, time: now });
          }
          const { path } = pathData;
          if (!path || path.length === 0) {
            showToast('该飞机暂无轨迹数据（可能为地面停机、数据不足或超出覆盖范围）');
            return;
          }
          // 按时间排序，OpenSky path 可能是逆序的（最新位置在前），需要确保升序
          const sortedPath = [...path].sort((a, b) => a.time - b.time);
          if (sortedPath.length > 1 && sortedPath[0].time > sortedPath[sortedPath.length - 1].time) {
            sortedPath.reverse();
          }
          const featurePath = sortedPath.map(({ lon, lat }: { lon: number; lat: number }) => fromLonLat([lon, lat]));
          lineCoords = featurePath;

          // remote 模式：将飞机位置更新到轨迹最新点，避免闪烁
          const lastPoint = featurePath[featurePath.length - 1];
          const geometry = planeFeature.getGeometry() as SimpleGeometry | undefined;
          if (geometry && lastPoint) {
            geometry.setCoordinates(lastPoint);
            planeFeature.set("currentX", lastPoint[0]);
            planeFeature.set("currentY", lastPoint[1]);
          }

          // 画轨迹（不重复添加飞机当前位置，因为已经同步到最新点了）
          const pathLayer = getPathLayer();
          if (pathLayer) {
            pathLayer.getSource()?.addFeature(
              new Feature({ geometry: new LineString(lineCoords), icao24: icao24 }),
            );
          }

          // 最后才移动地图到飞机最新位置
          moveMapTo(lastPoint);
        }
      } catch (error) {
        console.error('Failed to fetch track:', error);
        showToast('获取轨迹数据失败，请稍后重试');
      } finally {
        isTrackLoading = false;
      }
    }, 300);
  };
  const removePath = () => {
    const pathLayer = getPathLayer();
    if (pathLayer) {
      pathLayer.getSource()?.clear();
    }
  };
};

export const clearSelection = () => {
  // Clear selected state on all aircraft
  const planeLayer = getPlaneLayer();
  if (planeLayer) {
    const source = planeLayer.getSource();
    if (source) {
      source.getFeatures().forEach((feature) => {
        feature.set("isSelected", 0);
      });
    }
  }

  // Clear path layer
  const pathLayer = getPathLayer();
  if (pathLayer) {
    pathLayer.getSource()?.clear();
  }

  // Clear clicked feature reference
  if (lastClickedFeatureRef) {
    lastClickedFeatureRef.set("isSelected", 0);
    lastClickedFeatureRef = null;
  }
};

const attachMoveEndEvent = (map: OLMap) => {
  map.on("moveend", () => {
    resumeUpdate();
    const view = map.getView();
    const center = view.getCenter();
    const projection = view.getProjection();
    const extent = projection.getExtent();

    if (center && extent) {
      const worldWidth = extent[2] - extent[0];
      const normalizedX =
        ((((center[0] - extent[0]) % worldWidth) + worldWidth) % worldWidth) +
        extent[0];

      if (Math.abs(center[0] - normalizedX) > worldWidth / 2) {
        view.setCenter([normalizedX, center[1]]);
      }
    }
  });
};

export const attachEvents = (map: OLMap) => {
  attachMoveEvents(map);
  attachClickEvents(map);
  attachMoveEndEvent(map);
  // 缩放开始时暂停动画循环，避免与瓦片加载抢资源
  (map as any).on("movebegin", () => pauseUpdate());
};
