import { fromLonLat } from "ol/proj";
import { openskyApi } from "src/api/opensky.api";
import { Feature } from "ol";
import { Point } from "ol/geom";

let lastUpdateTime = 0;
let lastRemoteUpdateTime = Date.now();
const REMOTE_UPDATE_INTERVAL = 15000;
let remoteAircraftData: any[] = [];

const getInterval = (zoom: number) => {
  zoom = Math.floor(zoom);
  const intervals = [, 5000, 4000, 3000, 2000, 1000, 500, 100, 50][zoom] || 16;
  return intervals;
};

export const update = (map: any) => {
  requestAnimationFrame(() => {
    update(map);
  });
  const now = Date.now();

  // Check if it's time for remote update
  if (now - lastRemoteUpdateTime >= REMOTE_UPDATE_INTERVAL) {
    lastRemoteUpdateTime = Date.now();
    openskyApi
      .getStates()
      .then((data) => {
        remoteAircraftData = data.states;
        console.log("Remote aircraft data updated:", remoteAircraftData.length);
      })
      .catch((error) => {
        console.error("Failed to fetch remote aircraft data:", error);
      });
  }

  const zoom = map.getView().getZoom();
  const interval = getInterval(zoom);

  if (now - lastUpdateTime >= interval) {
    console.log("update", interval);
    updateLayers(map);
    lastUpdateTime = now;
    // TODO: Update animation here
  }
};
const updateLayers = (map: any) => {
  if (remoteAircraftData.length) {
    applyRemoteState(map);
  }
  updatePlaneLayers(map);
  updatePathLayer(map);
};
const updatePlaneLayers = (map: any) => {
  const layers = map.getLayers().getArray();
  const planeLayers = layers.find(
    (layer: any) => layer.get("name") === "planes",
  );
  if (!planeLayers) return;
  const source = planeLayers.getSource();
  const features = source.getFeatures();
  for (const feature of features) {
    const lon = feature.get("lon");
    const lat = feature.get("lat");
    const heading = feature.get("heading");
    const velocity = feature.get("velocity");
    const timePosition = feature.get("timePosition");
    if (!velocity || !heading) {
      continue;
    }
    const [x, y] = fromLonLat([lon, lat]);
    const t = (Date.now() - timePosition) / 1000;
    const d = velocity * t;
    // Convert heading from degrees to radians
    const newPoint = [x + d * Math.sin(heading), y + d * Math.cos(heading)];
    feature.getGeometry().setCoordinates(newPoint);
  }
};
const updatePathLayer = (map: any) => { 
  const layers = map.getLayers().getArray();
  const pathLayer = layers.find(
    (layer: any) => layer.get("name") === "paths",
  );
  const planeLayer = layers.find(
    (layer: any) => layer.get("name") === "planes",
  );
  if (!pathLayer || !planeLayer) return;
  const source = pathLayer.getSource();
  const features = source.getFeatures();
  for (const feature of features) {
    const pathPoints = feature.getGeometry().getCoordinates();
    const icao24 = feature.get("icao24");
    const planeFeature = planeLayer
      .getSource()
      .getFeatures()
      .find((f: any) => f.get("icao24") === icao24);
    if (!planeFeature) {
      continue;
    }

    const curPoint = planeFeature.getGeometry().getCoordinates();
    pathPoints[pathPoints.length - 1] = curPoint;
    feature.getGeometry().setCoordinates([...pathPoints]);
  }
};

const applyRemoteState = (map: any) => {
  const layers = map.getLayers().getArray();
  const airplaneSource = layers
    .find((layer: any) => layer.get("name") === "planes")
    ?.getSource();
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
      airplaneSource.removeFeature(feature);
    }
  }
  for (const [_, newState] of remoteStateMap) {
    const feature = new Feature({
      geometry: new Point(fromLonLat([newState.lon, newState.lat])),
      ...newState,
      timePosition: Date.now(),
      isHovered: 0,
      isSelect: 0,
    });
    airplaneSource.addFeature(feature);
  }
  remoteAircraftData = [];
};
