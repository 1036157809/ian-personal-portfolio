import "ol/ol.css";
import { Map as OLMap } from "ol";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import { createMapLayers } from "./mapLayer";
import { createPlaneLayersFromCache } from "./planeLayer";
import { attachEvents, clearSelection } from "./event";
import {
  startUpdate,
  stopUpdate,
  setLayerRefs,
} from "./update";
import {
  loadCacheData,
  setCacheData,
  switchDataMode,
  getDataMode,
  refreshStates,
} from "./dataSource";
import { checkNetworkQuality } from "src/utils/network";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { LAYER_NAMES } from "./constants";

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

  // 懒加载缓存数据 JSON
  const cacheData = await loadCacheData();
  setCacheData(cacheData);

  // 用缓存数据秒加载飞机图层
  const planeLayers = createPlaneLayersFromCache(cacheData);

  // Don't proceed if map was destroyed during initialization
  if (!mapInstance) return;

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
    setLayerRefs(planeLayer as unknown as VectorLayer<VectorSource>, pathLayer as unknown as VectorLayer<VectorSource>);
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
    // 停止动画循环
    stopUpdate();

    // 清除选中状态
    clearSelection();

    // 切换到 cache 模式（重新注入缓存飞机数据）
    switchDataMode("cache");

    // 重置地图视图
    mapInstance.getView().setCenter(center);
    mapInstance.getView().setZoom(1);

    // 重启动画循环（cache 模式下不会调远程 API）
    startUpdate(mapInstance);
  }
};

// 导出数据模式切换 API 供外部调用
export { switchDataMode, getDataMode };
// 导出刷新远程数据
export { refreshStates };
// 导出弱网检测
export { checkNetworkQuality };
