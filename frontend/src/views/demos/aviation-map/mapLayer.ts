import TileLayer from "ol/layer/WebGLTile";
import XYZ from "ol/source/XYZ";

const TOKEN = import.meta.env.VITE_TIANDITU_TOKEN;

export const createMapLayers = () => [
  new TileLayer({
    source: new XYZ({
      url: `http://t0.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TOKEN}`,
    }),
  } as any),
  new TileLayer({
    source: new XYZ({
      url: `http://t0.tianditu.gov.cn/cta_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TOKEN}`,
    }),
  } as any),
];
