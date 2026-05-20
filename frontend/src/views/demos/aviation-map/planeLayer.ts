import { Feature } from "ol";
import { Point } from "ol/geom";
import VectorLayer from "ol/layer/WebGLVector";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import planeIcon from "/images/map/plane.svg";
import { openskyApi } from "src/api/opensky.api";
import { LAYER_NAMES } from "./constants";

const createFeatures = async () => {
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
};
const createPlanes = async () => {
  const features = await createFeatures();
  const source = new VectorSource({
    features,
  });
  const planeStyle = {
    "icon-src": planeIcon,
    "icon-width": 32,
    "icon-height": 32,
    "icon-anchor": [0.5, 0.5],
    "icon-rotate-with-view": true,
  };
  const normalStyle = {
    ...planeStyle,
    "icon-rotation": ["get", "heading"],
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
  return [planeLayer, activePlaneLayer];
};
const createPath = () => {
  const layer = new VectorLayer({
    properties: { name: LAYER_NAMES.PATHS },
    source: new VectorSource(),
    style: {
      "stroke-color": "#f40",
      "stroke-width": 2,
    },
  });
  return [layer];
};
export const createPlaneLayers = async () => {
  const planeLayers = await createPlanes();
  const pathLayers = createPath();
  return [...planeLayers, ...pathLayers];
};
