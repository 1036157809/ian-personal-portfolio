import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/webGLTile'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import WebGLVector from 'ol/layer/WebGLVector'
import { Vector as VectorSource } from 'ol/source'

export const createMap = (
  mapContainer: string,
  aircraftSource: VectorSource<any>,
  trajectorySource: VectorSource<any>,
  activeLayer: any,
  TOKEN: string,
  CENTER: [number, number]
): Map => {
  // Tianditu terrain WMTS source
  const tiandituTerrainSource = new XYZ({
    url: `http://t0.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TOKEN}`,
    projection: 'EPSG:3857',
    maxZoom: 18
  })

  // Tianditu annotation WMTS source
  const tiandituAnnotationSource = new XYZ({
    url: `http://t0.tianditu.gov.cn/cta_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TOKEN}`,
    projection: 'EPSG:3857',
    maxZoom: 18
  })

  const map = new Map({
    target: mapContainer,
    layers: [
      new TileLayer({
        source: tiandituTerrainSource as any,
        properties: { name: 'terrain' }
      }),
      new TileLayer({
        source: tiandituAnnotationSource as any,
        properties: { name: 'annotation' }
      }),
      new WebGLVector({
        source: trajectorySource,
        style: {
          'stroke-color': 'red',
          'stroke-width': 2
        },
        properties: { name: 'trajectory' },
        zIndex: 10
      }),
      new WebGLVector({
        source: aircraftSource,
        style: {
          'icon-src': '/images/plane.svg',
          'icon-width': 32,
          'icon-height': 32,
          'icon-anchor': [0.5, 0.5],
          'icon-rotate-with-view': true,
          'icon-rotation': ['*', ['get', 'heading'], Math.PI / 180],
          'icon-color': 'white'
        },
        properties: { name: 'aircraft' },
        zIndex: 20
      }),
      activeLayer
    ],
    view: new View({
      center: fromLonLat(CENTER),
      zoom: 1,
      minZoom: 1,
      maxZoom: 13,
      projection: 'EPSG:3857'
    })
  })

  return map
}
