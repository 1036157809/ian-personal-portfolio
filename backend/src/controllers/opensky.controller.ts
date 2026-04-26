import { Context } from 'koa';
import openskyService from '../services/opensky.service';

// Cache for aircraft states (30 minutes)
let statesCache: any = null;
let statesCacheTime: number = 0;
const CACHE_TTL = 1800000; // 30 minutes

export class OpenSkyController {
  async getStatesAll(ctx: Context) {
    try {
      // Check cache
      const now = Date.now();
      if (statesCache && (now - statesCacheTime) < CACHE_TTL) {
        console.log('Returning cached states');
        ctx.body = statesCache;
        return;
      }

      const apiStartTime = Date.now();
      const data = await openskyService.getStatesAll();
      const apiEndTime = Date.now();
      console.log(`OpenSky API call took: ${apiEndTime - apiStartTime}ms`);

      const transformStartTime = Date.now();
      // Transform OpenSky data to frontend format
      // OpenSky format: [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, baro_altitude, on_ground, velocity, true_track, vertical_rate, sensors, geo_altitude, squawk, spi, position_source]
      const states = data.states
        .filter((state: any) => state[5] !== null && state[6] !== null) // Filter out null coordinates
        .map((state: any) => ({
          icao24: state[0],
          altitude: state[7] || state[13] || 0, // baro_altitude or geo_altitude
          heading: state[10] || 0, // true_track
          lat: state[6],
          lon: state[5],
          timePosition: state[3],
          velocity: state[9] || 0
        }));
      const transformEndTime = Date.now();
      console.log(`Data transformation took: ${transformEndTime - transformStartTime}ms`);
      console.log(`Total states count: ${states.length}`);
      
      const result = { states };
      
      // Update cache
      statesCache = result;
      statesCacheTime = now;
      
      ctx.body = result;
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

      // Use current timestamp to get recent tracks
      const time = Math.floor(Date.now() / 1000);
      const tracks = await openskyService.getTracks(icao24, time);
      console.log('Tracks response:', tracks);

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
