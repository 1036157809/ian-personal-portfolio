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
    if (lastClickedFeatureRef) {
      lastClickedFeatureRef.set("isSelected", 0);
      lastClickedFeatureRef = null;
      removePath();
    }
    const features = map.getFeaturesAtPixel(e.pixel, {
      layerFilter: (layer: BaseLayer) => layer.get("name") === LAYER_NAMES.PLANES,
      hitTolerance: 3,
    });
    const clickedFeature = features[0] as Feature | undefined;
    if (clickedFeature) {
      addPath(clickedFeature);
      lastClickedFeatureRef = clickedFeature;
      lastClickedFeatureRef.set("isSelected", 1);
      const geometry = clickedFeature.getGeometry() as SimpleGeometry | undefined;
      const center = geometry?.getCoordinates() as number[] | undefined;
      if (center) {
        map.getView().setCenter(center);
        map
          .getView()
          .animate({ center, duration: 500 }, { zoom: 12, duration: 500 });
      }
    }
  });
  const addPath = (planeFeature: Feature) => {
    if (isTrackLoading) return;
    if (trackDebounceTimer) {
      clearTimeout(trackDebounceTimer);
      trackDebounceTimer = null;
    }
    trackDebounceTimer = setTimeout(async () => {
      isTrackLoading = true;
      try {
        const geometry = planeFeature.getGeometry() as SimpleGeometry | undefined;
        if (!geometry) return;
        const curPoint = geometry.getCoordinates() as number[];
        const [curX, curY] = curPoint;

        let lineCoords: number[][];

        if (getDataMode() === "cache") {
          // cache 模式：用本地数据模拟轨迹，不调用任何接口
          const heading = (planeFeature.get("heading") as number | null) ?? 0;
          const velocity = (planeFeature.get("velocity") as number | null) ?? 0;
          lineCoords = generateSyntheticTrack(curX, curY, heading, velocity);
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
          // 按时间升序排序，确保轨迹从过去到现在
          const sortedPath = [...path].sort((a, b) => a.time - b.time);
          const featurePath = sortedPath.map(({ lon, lat }: { lon: number; lat: number }) => fromLonLat([lon, lat]));
          lineCoords = [...featurePath, [curX, curY]];
        }

        const pathLayer = getPathLayer();
        if (pathLayer) {
          pathLayer
            .getSource()
            ?.addFeature(
              new Feature({
                geometry: new LineString(lineCoords),
                icao24: planeFeature.get("icao24") as string,
              }),
            );
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
  // Clear all selected states
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
};

const attachMoveEndEvent = (map: OLMap) => {
  map.on("moveend", () => {
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
};
