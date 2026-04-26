import { fromLonLat } from "ol/proj";
import WebGLVector from "ol/layer/WebGLVector";
import { Vector as VectorSource } from "ol/source";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";

// Create aircraft source
export const createAircraftSource = (): VectorSource<any> => {
  return new VectorSource();
};

// Create trajectory source
export const createTrajectorySource = (): VectorSource<any> => {
  return new VectorSource();
};

// Create active source
export const createActiveSource = (): VectorSource<any> => {
  return new VectorSource();
};

// Create active layer
export const createActiveLayer = (
  activeSource: VectorSource<any>,
): WebGLVector => {
  return new WebGLVector({
    source: activeSource,
    style: {
      "icon-src": "/images/plane.svg",
      "icon-width": 32,
      "icon-height": 32,
      "icon-anchor": [0.5, 0.5],
      "icon-rotate-with-view": true,
      "icon-rotation": ["*", ["get", "heading"], Math.PI / 180],
      "icon-color": "red",
    },
    zIndex: 100,
  });
};

// Set active aircraft
export const setActiveAircraft = (
  aircraftId: string | number,
  lon: number,
  lat: number,
  heading: number,
  activeSource: VectorSource<any>,
): void => {
  activeSource.clear();
  const coordinates = fromLonLat([lon, lat]);
  const feature = new Feature({
    geometry: new Point(coordinates),
    icao24: aircraftId,
    heading: heading,
  });
  activeSource.addFeature(feature);
};

// Clear active aircraft
export const clearActiveAircraft = (activeSource: VectorSource<any>): void => {
  activeSource.clear();
};

// Initialize aircraft
export const initializeAircraft = (
  simulatedAircraft: any[],
  aircraftSource: VectorSource<any>,
  aircraftFeatures: Map<string, any>,
): void => {
  simulatedAircraft.forEach((aircraft) => {
    const coordinates = fromLonLat([aircraft.lon, aircraft.lat]);
    const feature = new Feature({
      geometry: new Point(coordinates),
      icao24: aircraft.icao24,
      heading: aircraft.heading,
      lon: aircraft.lon,
      lat: aircraft.lat,
      velocity: aircraft.velocity || 0,
      altitude: aircraft.altitude || 0,
      timePosition: aircraft.timePosition || null,
    });
    aircraftFeatures.set(String(aircraft.icao24), feature);
    aircraftSource.addFeature(feature);
  });
};

// Add trajectory from tracks
export const addTrajectoryFromTracks = (
  aircraftId: string | number,
  path: any[],
  trajectorySource: VectorSource<any>,
  trajectoryPoints: number[][],
  allTrajectories: Map<string, any>,
  updateTrajectoryLine: (
    source: VectorSource<any>,
    points: number[][],
    id: string | number,
  ) => void,
  currentPoint?: number[],
): void => {
  trajectorySource.clear();
  trajectoryPoints.length = 0;

  // Handle both TrackPoint[] and number[][] formats
  const coordinates = path.map((point: any) => {
    if (
      typeof point === "object" &&
      point.lat !== undefined &&
      point.lon !== undefined
    ) {
      // TrackPoint format
      return fromLonLat([point.lon, point.lat]);
    } else {
      // number[][] format [time, lat, lon, ...]
      return fromLonLat([point[2], point[1]]);
    }
  });
  console.log("Trajectory coordinates:", coordinates);

  // Append current aircraft position to trajectory
  if (currentPoint) {
    coordinates.push(currentPoint);
  }

  allTrajectories.set(String(aircraftId), coordinates);
  trajectoryPoints.push(...coordinates);
  updateTrajectoryLine(trajectorySource, trajectoryPoints, aircraftId);
};

// Update trajectory line
export const updateTrajectoryLine = (
  trajectorySource: VectorSource<any>,
  trajectoryPoints: number[][],
  aircraftId?: string | number,
): void => {
  console.log(
    "Updating trajectory line, points count:",
    trajectoryPoints.length,
  );
  if (trajectoryPoints.length > 1) {
    const lineFeature = new Feature({
      geometry: new LineString(trajectoryPoints),
      icao24: aircraftId,
    });
    trajectorySource.addFeature(lineFeature);
    trajectorySource.changed();
  }
};
