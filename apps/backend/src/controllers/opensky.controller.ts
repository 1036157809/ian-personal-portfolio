import { Context } from 'koa';
import openskyService from '../services/opensky.service';

// Cache for aircraft states (supports multiple bbox keys)
const statesCacheMap = new Map<string, { data: any; time: number }>();

// Cache for aircraft tracks (15s fixed)
const tracksCache = new Map<string, { data: any; time: number }>();
const TRACKS_CACHE_TTL = 15000; // 15 seconds

// Dynamic cache TTL based on time of day
const getCacheTTL = (): number => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) {
    return 15000; // 15 seconds from 6 AM to 6 PM
  } else {
    return 3600000; // 1 hour for other times
  }
};

export class OpenSkyController {
  async getStatesAll(ctx: Context) {
    try {
      // Parse bbox from query params
      const { lamin, lamax, lomin, lomax } = ctx.query;
      const bbox = (lamin && lamax && lomin && lomax)
        ? [Number(lamin), Number(lamax), Number(lomin), Number(lomax)]
        : undefined;

      // Check cache
      const now = Date.now();
      const cacheTTL = getCacheTTL();
      const cacheKey = bbox ? bbox.join(',') : 'all';

      const cached = statesCacheMap.get(cacheKey);
      if (cached && (now - cached.time) < cacheTTL) {
        console.log('Returning cached states for:', cacheKey);
        ctx.body = cached.data;
        return;
      }

      const apiStartTime = Date.now();
      const data = await openskyService.getStatesAll(bbox ? { bbox } : undefined);
      const apiEndTime = Date.now();
      console.log(`OpenSky API call took: ${apiEndTime - apiStartTime}ms`);
      console.log(`Total states count: ${data.states.length}`);
      
      // Update cache
      statesCacheMap.set(cacheKey, { data, time: now });
      
      ctx.body = data;
    } catch (error: any) {
      console.error('Error fetching states:', error.message);
      ctx.status = 500;
      ctx.body = { error: 'Failed to get aircraft states', message: error.message };
    }
  }

  async getTracks(ctx: Context) {
    try {
      const { icao24 } = ctx.params;
      console.log('Fetching tracks for aircraft:', icao24);

      // Check cache
      const now = Date.now();
      const cached = tracksCache.get(icao24);
      if (cached && (now - cached.time) < TRACKS_CACHE_TTL) {
        console.log('Returning cached tracks for:', icao24);
        ctx.body = cached.data;
        return;
      }

      // Use current timestamp to get recent tracks
      const time = Math.floor(Date.now() / 1000);
      const tracks = await openskyService.getTracks(icao24, time);
      console.log('Tracks response:', tracks);

      // Update cache
      tracksCache.set(icao24, { data: tracks, time: now });

      ctx.body = tracks;
    } catch (error: any) {
      console.error('Error fetching tracks:', error.message);
      console.error('Error details:', error.response?.status || error);

      // If 404 (no data), return empty array
      if (error.response?.status === 404) {
        console.log('No tracks available for aircraft:', ctx.params.icao24);
        ctx.body = { path: [] };
        return;
      }

      ctx.status = 500;
      ctx.body = { error: 'Failed to get aircraft tracks', message: error.message };
    }
  }
}

export default new OpenSkyController();
