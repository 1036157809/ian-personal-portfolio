import { fromLonLat, toLonLat } from "ol/proj";
import { openskyApi, cancelPendingRequest } from "src/api/opensky.api";
import { Feature, Map as OLMap } from "ol";
import { Point, SimpleGeometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import type { AircraftState, BBox } from "src/api/opensky.api";
import { invalidateClickedFeature } from "./event";

// Cached layer refs to avoid repeated find() lookups
let planeLayerRef: VectorLayer<VectorSource> | null = null;
let pathLayerRef: VectorLayer<VectorSource> | null = null;

export const setLayerRefs = (plane: VectorLayer<VectorSource>, path: VectorLayer<VectorSource>) => {
  planeLayerRef = plane;
  pathLayerRef = path;
};
let lastUpdateTime = 0;
let lastRemoteUpdateTime = Date.now();
const REMOTE_UPDATE_INTERVAL = 15000;
const remoteAircraftData: AircraftState[] = [];
let updateTimerId: ReturnType<typeof setTimeout> | null = null;
let isRunning = false;

const getInterval = (zoom: number) => {
  zoom = Math.floor(zoom);
  // Intervals per zoom level (1-8+), minimum 100ms to reduce CPU usage
  const intervals: Record<number, number> = {
    1: 5000, 2: 4000, 3: 3000, 4: 2000,
    5: 1000, 6: 500, 7: 200, 8: 100,
  };
  return intervals[zoom] || 100;
};

export const update = (map: OLMap) => {
  if (!isRunning) return;
  const now = Date.now();

  // Check if it's time for remote update
  if (now - lastRemoteUpdateTime >= REMOTE_UPDATE_INTERVAL) {
    lastRemoteUpdateTime = Date.now();
    const bbox = getViewBBox(map);
    openskyApi
      .getStates(bbox)
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
    updateLayers();
    lastUpdateTime = now;
  }

  // Schedule next update at the appropriate interval
  updateTimerId = setTimeout(() => update(map), interval);
};
const updateLayers = () => {
  if (remoteAircraftData.length) {
    applyRemoteState();
  }
  updatePlaneLayers();
  updatePathLayer();
};
const updatePlaneLayers = () => {
  if (!planeLayerRef) return;
  const source = planeLayerRef.getSource();
  if (!source) return;
  const features = source.getFeatures();
  const now = Date.now();
  for (const feature of features) {
    const heading = feature.get("heading") as number;
    const velocity = feature.get("velocity") as number;
    const timePosition = feature.get("timePosition") as number;
    if (!velocity || !heading) {
      continue;
    }
    // Use cached projected coordinates instead of recalculating every frame
    const x = feature.get("projX") as number;
    const y = feature.get("projY") as number;
    if (x == null || y == null) continue;
    const t = (now - timePosition) / 1000;
    const d = velocity * t;
    const newPoint = [x + d * Math.sin(heading), y + d * Math.cos(heading)];
    const geometry = feature.getGeometry() as SimpleGeometry | undefined;
    if (geometry) {
      geometry.setCoordinates(newPoint);
    }
  }
};
// Map for O(1) icao24 -> feature lookup
const featureMap = new Map<string, Feature>();

const updatePathLayer = () => {
  if (!pathLayerRef || !planeLayerRef) return;
  const source = pathLayerRef.getSource();
  if (!source) return;
  const features = source.getFeatures();
  for (const feature of features) {
    const geometry = feature.getGeometry() as SimpleGeometry | undefined;
    if (!geometry) continue;
    const pathPoints = geometry.getCoordinates() as number[][];
    const icao24 = feature.get("icao24") as string;
    const planeFeature = featureMap.get(icao24);
    if (!planeFeature) continue;
    const planeGeometry = planeFeature.getGeometry() as SimpleGeometry | undefined;
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
  if (updateTimerId !== null) {
    clearTimeout(updateTimerId);
    updateTimerId = null;
  }
  // Cancel any pending API request
  cancelPendingRequest();
};

const getViewBBox = (map: OLMap): BBox | undefined => {
  const view = map.getView();
  const zoom = view.getZoom() ?? 1;
  // Only filter by bbox when zoomed in enough (zoom > 3)
  // At low zoom levels, the view covers most of the world, so filtering is not useful
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

export const refreshStates = async (map: OLMap) => {
  cancelPendingRequest();
  remoteAircraftData.length = 0;
  try {
    const bbox = getViewBBox(map);
    const res = await openskyApi.getStates(bbox);
    if (!isRunning) return;
    remoteAircraftData.push(...res.states);
    if (remoteAircraftData.length) {
      applyRemoteState();
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") return;
    console.error("Failed to refresh states:", error);
  }
};

const applyRemoteState = () => {
  if (!planeLayerRef) return;
  const airplaneSource = planeLayerRef.getSource();
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
      // Batch update with setProperties to reduce change events
      const [projX, projY] = fromLonLat([newState.lon, newState.lat]);
      feature.setProperties({
        icao24: newState.icao24,
        lon: newState.lon,
        lat: newState.lat,
        heading: newState.heading,
        velocity: newState.velocity,
        timePosition: newState.timePosition,
        altitude: newState.altitude,
        projX,
        projY,
      });
      featureMap.set(newState.icao24, feature);
      remoteStateMap.delete(icao24);
    } else {
      invalidateClickedFeature(feature);
      featureMap.delete(icao24);
      airplaneSource.removeFeature(feature);
    }
  }
  for (const [_, newState] of remoteStateMap) {
    const [projX, projY] = fromLonLat([newState.lon, newState.lat]);
    const feature = new Feature({
      geometry: new Point([projX, projY]),
      ...newState,
      isHovered: 0,
      isSelected: 0,
      projX,
      projY,
    });
    featureMap.set(newState.icao24, feature);
    airplaneSource.addFeature(feature as any);
  }
  remoteAircraftData.length = 0;
};
