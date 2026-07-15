import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/WebGLVector";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import planeIcon from "src/assets/images/map/plane.svg";
import { openskyApi } from "src/api/opensky.api";
import type { AircraftState } from "src/api/opensky.api";
import { LAYER_NAMES } from "./constants";

const createFeatures = async () => {
  try {
    const res = await openskyApi.getStates();
    return res.states.map((state) => {
      const [projX, projY] = fromLonLat([state.lon, state.lat]);
      return new Feature({
        geometry: new Point([projX, projY]),
        ...state,
        isHovered: 0,
        isSelected: 0,
        projX,
        projY,
      });
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") return [];
    throw error;
  }
};

/**
 * 从缓存数据创建 Features，不发起 API 请求
 */
const createFeaturesFromCache = (cacheData: AircraftState[]) => {
  return cacheData.map((state) => {
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
  });
};

const buildLayers = (features: Feature[]) => {
  const source = new VectorSource({ features });
  const planeStyle = {
    "icon-src": planeIcon,
    "icon-width": 32,
    "icon-height": 32,
    "icon-anchor": [0.5, 0.5],
    "icon-rotate-with-view": true,
  };
  const normalStyle = {
    ...planeStyle,
    "icon-rotation": ["*", ["get", "heading"], Math.PI / 180],
  };
  const activeStyle = {
    ...normalStyle,
    "icon-color": "#f40",
  };
  const planeLayer = new VectorLayer({
    properties: { name: LAYER_NAMES.PLANES },
    source,
    style: normalStyle,
  });
  const activePlaneLayer = new VectorLayer({
    properties: { name: LAYER_NAMES.ACTIVE_PLANES },
    source,
    style: [
      {
        filter: [">", ["+", ["get", "isHovered"], ["get", "isSelected"]], 0],
        style: activeStyle,
      },
    ],
  });
  const pathLayer = new VectorLayer({
    properties: { name: LAYER_NAMES.PATHS },
    source: new VectorSource(),
    style: {
      "stroke-color": "#f40",
      "stroke-width": 2,
    },
  });
  return [planeLayer, activePlaneLayer, pathLayer];
};

/**
 * 从远程 API 创建飞机图层（原有逻辑）
 */
export const createPlaneLayers = async () => {
  const features = await createFeatures();
  return buildLayers(features);
};

/**
 * 从缓存数据创建飞机图层，不发起 API 请求
 */
export const createPlaneLayersFromCache = (cacheData: AircraftState[]) => {
  const features = createFeaturesFromCache(cacheData);
  return buildLayers(features);
};
