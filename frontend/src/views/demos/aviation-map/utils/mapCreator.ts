import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style'

// Configuration constants
export const TOKEN = 'f68bb17559b334a7ab0ff0e8f5642930'
export const CENTER: [number, number] = [116.4074, 39.9042] // Beijing coordinates

export interface MapOptions {
  target: string
  center?: [number, number]
  zoom?: number
  minZoom?: number
  maxZoom?: number
}

export const createAviationMap = (options: MapOptions, vectorSource: VectorSource): Map => {
  const {
    target,
    center = CENTER,
    zoom = 1,
    minZoom = 1,
    maxZoom = 13
  } = options

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
    target,
    layers: [
      new TileLayer({
        source: tiandituTerrainSource,
        properties: { name: 'terrain' }
      }),
      new TileLayer({
        source: tiandituAnnotationSource,
        opacity: 0.9,
        properties: { name: 'annotation' }
      }),
      new VectorLayer({
        source: vectorSource,
        style: new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: 'rgba(255, 0, 0, 0.8)' }),
            stroke: new Stroke({ color: '#fff', width: 2 })
          })
        }),
        properties: { name: 'markers' }
      })
    ],
    view: new View({
      center: fromLonLat(center),
      zoom,
      minZoom,
      maxZoom,
      projection: 'EPSG:3857' // Web Mercator projection
    })
  })

  return map
}
