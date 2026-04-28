import { request } from 'src/utils/request';

let currentAbortController: AbortController | null = null;

export const cancelPendingRequest = () => {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
};

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
    // Cancel any pending request
    cancelPendingRequest();
    
    // Create new AbortController for this request
    currentAbortController = new AbortController();
    
    try {
      return await request<StatesResponse>('/api/opensky/states', {
        signal: currentAbortController.signal,
      });
    } finally {
      // Clear the controller after request completes
      if (currentAbortController?.signal.aborted === false) {
        currentAbortController = null;
      }
    }
  },

  async getTracks(icao24: string): Promise<TracksResponse> {
    return request<TracksResponse>(`/api/opensky/tracks/${icao24}`);
  },
};
