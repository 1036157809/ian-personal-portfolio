import { fromLonLat } from 'ol/proj'
import { setActiveAircraft, clearActiveAircraft } from './planeLayer'

// Map control functions
export const zoomTo = (map: any, coordinates: number[], zoom: number, duration: number = 500): void => {
  if (map) {
    map.getView().animate({
      center: coordinates,
      zoom,
      duration
    })
  }
}

export const resetView = (map: any, CENTER: [number, number]): void => {
  if (map) {
    map.getView().setCenter(fromLonLat(CENTER))
    map.getView().setZoom(1)
  }
}

export const setupSeamlessDragging = (map: any): void => {
  if (!map) return
  map.on('moveend', () => {
    const view = map.getView()
    const center = view.getCenter()
    const projection = view.getProjection()
    const extent = projection.getExtent()
    
    if (center && extent) {
      const worldWidth = extent[2] - extent[0]
      const normalizedX = ((center[0] - extent[0]) % worldWidth + worldWidth) % worldWidth + extent[0]
      
      if (Math.abs(center[0] - normalizedX) > worldWidth / 2) {
        view.setCenter([normalizedX, center[1]])
      }
    }
  })
}

// Setup map interactions
export const setupMapInteractions = (
  map: any,
  activeSource: any,
  activeAircraftIdObj: { value: string | number | null },
  addTrajectoryFromTracks: (aircraftId: number, path: number[][]) => void
): void => {
  if (!map) return

  map.on('pointermove', (e: any) => {
    if (e.dragging) return

    const pixel = map.getEventPixel(e.originalEvent)
    const hit = map.hasFeatureAtPixel(pixel, { hitTolerance: 3 })
    const mapElement = document.getElementById('map')

    if (hit && mapElement) {
      mapElement.style.cursor = 'pointer'
      const features = map.getFeaturesAtPixel(pixel, { hitTolerance: 3 })
      features.forEach((feature: any) => {
        if (feature.get('id')) {
          const aircraftId = feature.get('id')
          const heading = feature.get('heading') || 0
          const lon = feature.get('lon')
          const lat = feature.get('lat')
          
          if (lon !== undefined && lat !== undefined) {
            setActiveAircraft(aircraftId, lon, lat, heading, activeSource)
          }
        }
      })
    } else if (mapElement) {
      mapElement.style.cursor = 'default'
      clearActiveAircraft(activeSource)
    }
  })

  map.on('click', async (e: any) => {
    const pixel = map.getEventPixel(e.originalEvent)
    const features = map.getFeaturesAtPixel(pixel, { hitTolerance: 3 })
    const clickedAircraft = features.find((feature: any) => feature.get('id'))

    if (clickedAircraft) {
      const aircraftId = clickedAircraft.get('id')
      const heading = clickedAircraft.get('heading') || 0
      const lon = clickedAircraft.get('lon')
      const lat = clickedAircraft.get('lat')
      
      if (lon !== undefined && lat !== undefined) {
        setActiveAircraft(aircraftId, lon, lat, heading, activeSource)
      }

      // Set active aircraft ID for remote tracking
      activeAircraftIdObj.value = aircraftId

      console.log('Clicked aircraft:', aircraftId)
      console.log('Starting fetch to:', `http://localhost:3001/opensky/tracks/${aircraftId}`)

      try {
        const response = await fetch(`http://localhost:3001/opensky/tracks/${aircraftId}`)
        if (!response.ok) {
          console.log('Failed to fetch tracks, status:', response.status)
          return
        }
        const tracksData = await response.json()
        console.log('Tracks data:', tracksData)

        if (tracksData.path && tracksData.path.length > 0) {
          addTrajectoryFromTracks(Number(aircraftId), tracksData.path)
        }
      } catch (error) {
        console.error('Failed to fetch aircraft tracks:', error)
      }

      const geometry = clickedAircraft.getGeometry()
      if (geometry) {
        const coordinates = geometry.getCoordinates()
        zoomTo(map, coordinates, 12, 500)
      }
    } else {
      clearActiveAircraft(activeSource)
      activeAircraftIdObj.value = null
    }
  })
}
