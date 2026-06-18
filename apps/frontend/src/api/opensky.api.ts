import { request } from 'src/utils/request';
import type { AircraftState, StatesResponse, TrackPoint, TracksResponse } from '@ianportfolio/shared';

export { type AircraftState, type StatesResponse, type TrackPoint, type TracksResponse };

let currentAbortController: AbortController | null = null;

export const cancelPendingRequest = () => {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
};

export interface BBox {
  lamin: number;
  lamax: number;
  lomin: number;
  lomax: number;
}

export const openskyApi = {
  async getStates(bbox?: BBox): Promise<StatesResponse> {
    cancelPendingRequest();

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
      if (currentAbortController === controller) {
        currentAbortController = null;
      }
    }
  },

  async getTracks(icao24: string): Promise<TracksResponse> {
    return request<TracksResponse>(`/opensky/tracks/${icao24}`);
  },
};
