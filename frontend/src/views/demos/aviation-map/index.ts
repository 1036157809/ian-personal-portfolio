import "ol/ol.css";
import { Map as OLMap } from "ol";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import { createMapLayers } from "./mapLayer";
import { createPlaneLayers } from "./planeLayer";
import { LAYER_NAMES } from "./constants";
import { attachEvents, clearSelection } from "./event";
import { startUpdate, stopUpdate, refreshStates, setLayerRefs } from "./update";

const center = fromLonLat([116.4074, 39.9042]);
interface ToastInstance {
  show: (message: string) => void;
}

let mapInstance: OLMap | null = null;
let toastInstance: ToastInstance | null = null;

export const setToast = (toast: ToastInstance) => {
  toastInstance = toast;
};

export const showToast = (message: string) => {
  if (toastInstance) {
    toastInstance.show(message);
  }
};

export const initMap = async (container: HTMLElement) => {
  const map = new OLMap({
    target: container,
    layers: [],
    view: new View({
      center,
      zoom: 1,
      minZoom: 1,
      maxZoom: 13,
    }),
  });
  mapInstance = map;
  createMapLayers().forEach((layer) => {
    map.addLayer(layer);
  });
  const planeLayers = await createPlaneLayers();
  planeLayers.forEach((layer) => {
    map.addLayer(layer);
  });

  // Cache layer refs for update loop
  const planeLayer = planeLayers.find(
    (layer) => layer.get("name") === LAYER_NAMES.PLANES,
  );
  const pathLayer = planeLayers.find(
    (layer) => layer.get("name") === LAYER_NAMES.PATHS,
  );
  if (planeLayer && pathLayer) {
    setLayerRefs(
      planeLayer as any,
      pathLayer as any,
    );
  }

  attachEvents(map);
  startUpdate(map);
};

export const destroyMap = () => {
  stopUpdate();
  if (mapInstance) {
    mapInstance.setTarget(undefined);
    mapInstance = null;
  }
};

export const resetView = () => {
  if (mapInstance) {
    // Stop update loop and cancel pending requests
    stopUpdate();
    
    // Clear selected aircraft state
    clearSelection(mapInstance);
    
    // Reset view
    mapInstance.getView().setCenter(center);
    mapInstance.getView().setZoom(1);
    
    // Immediately call states API (cancels any pending requests)
    refreshStates(mapInstance);
    
    // Restart update loop
    startUpdate(mapInstance);
  }
};
