import { fromLonLat } from "ol/proj";
import { openskyApi, cancelPendingRequest } from "src/api/opensky.api";
import { Feature, Map as OLMap } from "ol";
import { Point, SimpleGeometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import BaseLayer from "ol/layer/Base";
import { LAYER_NAMES } from "./constants";
import type { AircraftState } from "src/api/opensky.api";
import { invalidateClickedFeature } from "./event";

let planeLayer: VectorLayer<VectorSource> | null = null;
let pathLayer: VectorLayer<VectorSource> | null = null;

export const setLayerRefs = (plane: VectorLayer<VectorSource>, path: VectorLayer<VectorSource>) => {
  planeLayer = plane;
  pathLayer = path;
};
let lastUpdateTime = 0;
let lastRemoteUpdateTime = Date.now();
const REMOTE_UPDATE_INTERVAL = 15000;
const remoteAircraftData: AircraftState[] = [];
let animationFrameId: number | null = null;
let isRunning = false;

const getInterval = (zoom: number) => {
  zoom = Math.floor(zoom);
  const intervals = [, 5000, 4000, 3000, 2000, 1000, 500, 100, 50][zoom] || 16;
  return intervals;
};

export const update = (map: OLMap) => {
  if (!isRunning) return;
  animationFrameId = requestAnimationFrame(() => {
    update(map);
  });
  const now = Date.now();

  // Check if it's time for remote update
  if (now - lastRemoteUpdateTime >= REMOTE_UPDATE_INTERVAL) {
    lastRemoteUpdateTime = Date.now();
    openskyApi
      .getStates()
      .then((res) => {
        if (!isRunning) return;
        remoteAircraftData.length = 0;
        remoteAircraftData.push(...res.states);
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        console.error("Failed to fetch remote aircraft data:", error);
      });
  }
  const zoom = map.getView().getZoom() ?? 1;
  const interval = getInterval(zoom);

  if (now - lastUpdateTime >= interval) {
    updateLayers(map);
    lastUpdateTime = now;
  }
};
const updateLayers = (map: OLMap) => {
  if (remoteAircraftData.length) {
    applyRemoteState(map);
  }
  updatePlaneLayers(map);
  updatePathLayer(map);
};
const updatePlaneLayers = (map: OLMap) => {
  const layers = map.getLayers().getArray();
  const planeLayers = layers.find(
    (layer: BaseLayer) => layer.get("name") === LAYER_NAMES.PLANES,
  ) as VectorLayer<VectorSource> | undefined;
  if (!planeLayers) {
    throw new Error("Missing planes layer");
  }
  const source = planeLayers.getSource();
  if (!source) {
    throw new Error("Missing planes source");
  }
  const features = source.getFeatures();
  for (const feature of features) {
    const lon = feature.get("lon") as number;
    const lat = feature.get("lat") as number;
    const heading = feature.get("heading") as number;
    const velocity = feature.get("velocity") as number;
    const timePosition = feature.get("timePosition") as number;
    if (!velocity || !heading) {
      continue;
    }
    const [x, y] = fromLonLat([lon, lat]);
    const t = (Date.now() - timePosition) / 1000;
    const d = velocity * t;
    // Convert heading from degrees to radians
    const newPoint = [x + d * Math.sin(heading), y + d * Math.cos(heading)];
    const geometry = feature.getGeometry() as SimpleGeometry | undefined;
    if (geometry) {
      geometry.setCoordinates(newPoint);
    }
  }
};
const updatePathLayer = (map: OLMap) => {
  const layers = map.getLayers().getArray();
  const pathLayer = layers.find(
    (layer: BaseLayer) => layer.get("name") === LAYER_NAMES.PATHS,
  ) as VectorLayer<VectorSource> | undefined;
  const planeLayer = layers.find(
    (layer: BaseLayer) => layer.get("name") === LAYER_NAMES.PLANES,
  ) as VectorLayer<VectorSource> | undefined;
  if (!pathLayer || !planeLayer) return;
  const source = pathLayer.getSource();
  const planeSource = planeLayer.getSource();
  if (!source || !planeSource) return;
  const features = source.getFeatures();
  for (const feature of features) {
    const geometry = feature.getGeometry() as SimpleGeometry | undefined;
    if (!geometry) continue;
    const pathPoints = geometry.getCoordinates() as number[][];
    const icao24 = feature.get("icao24") as string;
    const planeFeature = planeSource
      .getFeatures()
      .find((f) => f.get("icao24") === icao24);
    if (!planeFeature) {
      continue;
    }
    const planeGeometry = planeFeature.getGeometry() as
      | SimpleGeometry
      | undefined;
    if (!planeGeometry) continue;
    const curPoint = planeGeometry.getCoordinates() as number[];
    pathPoints[pathPoints.length - 1] = curPoint;
    geometry.setCoordinates([...pathPoints]);
  }
};

export const startUpdate = (map: OLMap) => {
  isRunning = true;
  update(map);
};

export const stopUpdate = () => {
  isRunning = false;
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  // Cancel any pending API request
  cancelPendingRequest();
};

export const refreshStates = async (map: OLMap) => {
  cancelPendingRequest();
  remoteAircraftData.length = 0;
  try {
    const res = await openskyApi.getStates();
    if (!isRunning) return;
    remoteAircraftData.push(...res.states);
    if (remoteAircraftData.length) {
      applyRemoteState(map);
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") return;
    console.error("Failed to refresh states:", error);
  }
};

const applyRemoteState = (map: OLMap) => {
  const layers = map.getLayers().getArray();
  const airplaneSource = (
    layers.find((layer: BaseLayer) => layer.get("name") === LAYER_NAMES.PLANES) as VectorLayer<VectorSource> | undefined
  )?.getSource();
  if (!airplaneSource) return;
  const planeFeatures = airplaneSource.getFeatures();

  const remoteStateMap = remoteAircraftData.reduce((acc, state) => {
    acc.set(state.icao24, state);
    return acc;
  }, new Map());
  for (const feature of planeFeatures) {
    const icao24 = feature.get("icao24");
    const newState = remoteStateMap.get(icao24);
    if (newState) {
      feature.set("icao24", newState.icao24);
      feature.set("lon", newState.lon);
      feature.set("lat", newState.lat);
      feature.set("heading", newState.heading);
      feature.set("velocity", newState.velocity);
      feature.set("timePosition", newState.timePosition);
      feature.set("altitude", newState.altitude);
      remoteStateMap.delete(icao24);
    } else {
      invalidateClickedFeature(feature);
      airplaneSource.removeFeature(feature);
    }
  }
  for (const [_, newState] of remoteStateMap) {
    const feature = new Feature({
      geometry: new Point(fromLonLat([newState.lon, newState.lat])),
      ...newState,
      isHovered: 0,
      isSelected: 0,
    });
    airplaneSource.addFeature(feature as any);
  }
  remoteAircraftData.length = 0;
};
