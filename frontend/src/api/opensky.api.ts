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

export interface BBox {
  lamin: number;
  lamax: number;
  lomin: number;
  lomax: number;
}

export const openskyApi = {
  async getStates(bbox?: BBox): Promise<StatesResponse> {
    // Cancel any pending request
    cancelPendingRequest();

    // Create new AbortController for this request
    const controller = new AbortController();
    currentAbortController = controller;

    const params: Record<string, string> = {};
    if (bbox) {
      params.lamin = bbox.lamin.toString();
      params.lamax = bbox.lamax.toString();
      params.lomin = bbox.lomin.toString();
      params.lomax = bbox.lomax.toString();
    }

    try {
      const query = bbox ? '?' + new URLSearchParams(params).toString() : '';
      return await request<StatesResponse>(`/opensky/states${query}`, {
        signal: controller.signal,
      });
    } finally {
      // Always clear the controller reference if it still points to this one
      if (currentAbortController === controller) {
        currentAbortController = null;
      }
    }
  },

  async getTracks(icao24: string): Promise<TracksResponse> {
    return request<TracksResponse>(`/opensky/tracks/${icao24}`);
  },
};
