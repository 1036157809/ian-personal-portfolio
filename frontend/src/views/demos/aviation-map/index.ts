import "ol/ol.css";
import { Map } from "ol";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import { createMapLayers } from "./mapLayer";
import { createPlaneLayers } from "./planeLayer";
import { attachEvents } from "./event";
import { update } from "./update";

const center = fromLonLat([116.4074, 39.9042]);
export const initMap = async (container: HTMLElement) => {
  const map = new Map({
    target: container,
    layers: [],
    view: new View({
      center,
      zoom: 1,
      minZoom: 1,
      maxZoom: 13,
    }),
  });
  createMapLayers().forEach((layer) => {
    map.addLayer(layer);
  });
  const planeLayer = await createPlaneLayers()
  planeLayer.forEach((layer) => {
    map.addLayer(layer);
  })
  attachEvents(map)
  update(map)
};
