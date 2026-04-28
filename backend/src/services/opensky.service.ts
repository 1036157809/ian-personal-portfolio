import axios from 'axios';

const OPENSKY_BASE_URL = 'https://opensky-network.org/api';
const AUTH_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

interface OpenSkyTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class OpenSkyService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.OPENSKY_CLIENT_ID!;
    this.clientSecret = process.env.OPENSKY_CLIENT_SECRET!;
  }

  private async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Validate credentials
    if (!this.clientId) {
      throw new Error('OPENSKY_CLIENT_ID is missing');
    }
    if (!this.clientSecret) {
      throw new Error('OPENSKY_CLIENT_SECRET is missing');
    }

    // Request new token
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);

    const response = await axios.post<OpenSkyTokenResponse>(AUTH_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Expire 1 minute early

    if (!this.accessToken) {
      throw new Error('Failed to obtain access token from OpenSky API');
    }

    return this.accessToken;
  }

  async getStatesAll(params?: {
    time?: number;
    icao24?: string[];
    bbox?: number[];
  }) {
    const token = await this.getAccessToken();
    const response = await axios.get(`${OPENSKY_BASE_URL}/states/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params
    });

    // Transform OpenSky data to frontend format
    // OpenSky format: [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, baro_altitude, on_ground, velocity, true_track, vertical_rate, sensors, geo_altitude, squawk, spi, position_source]
    
    // Log sample of raw velocity values
    const velocitySample = response.data.states.slice(0, 10).map((s: any) => s[9]);
    console.log('Sample velocity values from OpenSky:', velocitySample);
    console.log('Total states:', response.data.states.length);
    
    const states = response.data.states
      .filter((state: any) => state[5] !== null && state[6] !== null) // Filter out null coordinates
      .map((state: any) => ({
        icao24: state[0],
        altitude: state[7] ?? state[13] ?? 0, // baro_altitude or geo_altitude
        heading: state[10] !== null && state[10] !== undefined ? state[10] * Math.PI / 180 : null, // true_track (convert to radians)
        lat: state[6],
        lon: state[5],
        timePosition: state[3] * 1000, // convert to milliseconds
        velocity: state[9] ?? 0 // Keep 0 for stationary planes
      }));

    return { states };
  }

  async getTracks(icao24: string, time: number = 0) {
    const token = await this.getAccessToken();
    const response = await axios.get(`${OPENSKY_BASE_URL}/tracks/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        icao24,
        time
      }
    });

    // Process path array into explicit key-value pairs
    // path array format: [time, latitude, longitude, baro_altitude, true_track, on_ground]
    if (response.data.path && Array.isArray(response.data.path)) {
      response.data.path = response.data.path.map((item: any[]) => ({
        time: item[0],
        lat: item[1],
        lon: item[2],
        baro_altitude: item[3],
        true_track: item[4] * Math.PI / 180, // convert to radians
        on_ground: item[5]
      }));
    }

    return response.data;
  }
}

export default new OpenSkyService();
