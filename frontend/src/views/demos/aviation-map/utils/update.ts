import { fromLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector as VectorSource } from 'ol/source'

// Update intervals based on zoom level
const updateIntervals = [, 5000, 4000, 3000, 2000, 1000, 500, 100, 50]

// Get update interval based on current zoom level
export const getUpdateInterval = (map: any): number => {
  if (!map) return 16
  const zoom = Math.floor(map.getView().getZoom() || 1)
  return updateIntervals[zoom] || 16
}

// Calculate local position based on velocity and heading
export const calculateLocalPosition = (aircraft: any, deltaTime: number): { lon: number; lat: number } => {
  // velocity is in m/s, convert to degrees per second
  // Earth circumference ~40075km, so 1 degree ~111km
  const speedDegreesPerSecond = aircraft.velocity / 111000
  
  // Calculate distance moved
  const distance = speedDegreesPerSecond * (deltaTime / 1000)
  
  // Calculate new position based on heading
  const headingRad = aircraft.heading * Math.PI / 180
  const newLon = aircraft.lon + distance * Math.sin(headingRad)
  const newLat = aircraft.lat + distance * Math.cos(headingRad)
  
  return { lon: newLon, lat: newLat }
}

// Update aircraft position based on velocity and heading
export const updateAircraftPosition = (
  aircraft: any,
  deltaTime: number,
  aircraftFeatures: Map<string, any>,
  activeSource: VectorSource<any>,
  activeAircraftId: string | number | null
): void => {
  // Calculate new position
  const newPosition = calculateLocalPosition(aircraft, deltaTime)
  aircraft.lon = newPosition.lon
  aircraft.lat = newPosition.lat
  
  // Calculate coordinates
  const coordinates = fromLonLat([aircraft.lon, aircraft.lat])
  
  // Update feature on map
  const feature = aircraftFeatures.get(String(aircraft.id))
  if (feature) {
    feature.setGeometry(new Point(coordinates))
    feature.set('lon', aircraft.lon)
    feature.set('lat', aircraft.lat)
  }
  
  // Update active aircraft position if it's the same aircraft
  if (activeAircraftId === aircraft.id) {
    activeSource.clear()
    const activeFeature = new Feature({
      geometry: new Point(coordinates),
      id: aircraft.id,
      heading: aircraft.heading
    })
    activeSource.addFeature(activeFeature)
  }
}

// Main update function using requestAnimationFrame
export const createUpdate = (
  map: any,
  simulatedAircraft: any[],
  aircraftFeatures: Map<string, any>,
  activeSource: VectorSource<any>,
  activeAircraftIdRef: { value: string | number | null }
): (() => void) => {
  let lastUpdateTime = 0
  
  const update = (): void => {
    const now = Date.now()
    const deltaTime = now - lastUpdateTime
    const updateInterval = getUpdateInterval(map)
    
    // Check if it's time to update
    if (deltaTime >= updateInterval) {
      lastUpdateTime = now
      
      // Update all aircraft positions
      simulatedAircraft.forEach(aircraft => {
        updateAircraftPosition(aircraft, deltaTime, aircraftFeatures, activeSource, activeAircraftIdRef.value)
      })
    }
    
    requestAnimationFrame(update)
  }
  
  return update
}
