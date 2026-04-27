const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface AircraftState {
  icao24: string;
  lon: number;
  lat: number;
  heading: number;
  velocity: number;
  timePosition: number;
}

export interface StatesResponse {
  states: AircraftState[];
}

export interface TrackPoint {
  time: number;
  lat: number;
  lon: number;
  altitude: number;
  speed: number;
  onGround: boolean;
}

export interface TracksResponse {
  icao24: string;
  callsign: string;
  startTime: number;
  endTime: number;
  path: TrackPoint[];
}

export const openskyApi = {
  async getStates(): Promise<StatesResponse> {
    const response = await fetch(`${API_BASE_URL}/api/opensky/states`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch aircraft states');
    }

    return response.json();
  },

  async getTracks(icao24: string): Promise<TracksResponse> {
    const response = await fetch(`${API_BASE_URL}/api/opensky/tracks/${icao24}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch aircraft tracks');
    }

    return response.json();
  },
};
