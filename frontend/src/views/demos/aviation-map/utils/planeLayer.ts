import { fromLonLat } from 'ol/proj'
import WebGLVector from 'ol/layer/WebGLVector'
import { Vector as VectorSource } from 'ol/source'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import LineString from 'ol/geom/LineString'

// Create aircraft source
export const createAircraftSource = (): VectorSource<any> => {
  return new VectorSource()
}

// Create trajectory source
export const createTrajectorySource = (): VectorSource<any> => {
  return new VectorSource()
}

// Create active source
export const createActiveSource = (): VectorSource<any> => {
  return new VectorSource()
}

// Create active layer
export const createActiveLayer = (activeSource: VectorSource<any>): WebGLVector => {
  return new WebGLVector({
    source: activeSource,
    style: {
      'icon-src': '/images/plane.svg',
      'icon-width': 32,
      'icon-height': 32,
      'icon-anchor': [0.5, 0.5],
      'icon-rotate-with-view': true,
      'icon-rotation': ['*', ['get', 'heading'], Math.PI / 180],
      'icon-color': 'red'
    },
    zIndex: 100
  })
}

// Set active aircraft
export const setActiveAircraft = (aircraftId: string | number, lon: number, lat: number, heading: number, activeSource: VectorSource<any>): void => {
  activeSource.clear()
  const coordinates = fromLonLat([lon, lat])
  const feature = new Feature({
    geometry: new Point(coordinates),
    id: aircraftId,
    heading: heading
  })
  activeSource.addFeature(feature)
}

// Clear active aircraft
export const clearActiveAircraft = (activeSource: VectorSource<any>): void => {
  activeSource.clear()
}

// Initialize aircraft
export const initializeAircraft = (simulatedAircraft: any[], aircraftSource: VectorSource<any>, aircraftFeatures: Map<string, any>): void => {
  simulatedAircraft.forEach(aircraft => {
    const coordinates = fromLonLat([aircraft.lon, aircraft.lat])
    const feature = new Feature({
      geometry: new Point(coordinates),
      id: aircraft.id,
      heading: aircraft.heading,
      lon: aircraft.lon,
      lat: aircraft.lat
    })
    aircraftFeatures.set(String(aircraft.id), feature)
    aircraftSource.addFeature(feature)
  })
}

// Add trajectory from tracks
export const addTrajectoryFromTracks = (aircraftId: number, path: number[][], trajectorySource: VectorSource<any>, trajectoryPoints: number[][], allTrajectories: Map<string, any>, updateTrajectoryLine: () => void): void => {
  trajectorySource.clear()
  trajectoryPoints.length = 0

  const coordinates = path.map(point => fromLonLat([point[2], point[1]]))
  console.log('Trajectory coordinates:', coordinates)

  allTrajectories.set(String(aircraftId), coordinates)
  trajectoryPoints.push(...coordinates)
  updateTrajectoryLine()
}

// Update trajectory line
export const updateTrajectoryLine = (trajectorySource: VectorSource<any>, trajectoryPoints: number[][]): void => {
  console.log('Updating trajectory line, points count:', trajectoryPoints.length)
  if (trajectoryPoints.length > 1) {
    const lineFeature = new Feature({
      geometry: new LineString(trajectoryPoints)
    })
    trajectorySource.addFeature(lineFeature)
    trajectorySource.changed()
  }
}
