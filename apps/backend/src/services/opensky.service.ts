import axios from 'axios';
import { getOpenSkyClientId, getOpenSkyClientSecret } from './config';

const OPENSKY_BASE_URL = 'https://opensky-network.org/api';
const AUTH_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

interface OpenSkyTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class OpenSkyService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;

    const clientId = await getOpenSkyClientId();
    const clientSecret = await getOpenSkyClientSecret();
    if (!clientId) throw new Error('opensky_client_id is missing');
    if (!clientSecret) throw new Error('opensky_client_secret is missing');

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const response = await axios.post<OpenSkyTokenResponse>(AUTH_URL, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
    if (!this.accessToken) throw new Error('Failed to obtain access token from OpenSky API');
    return this.accessToken;
  }

  async getStatesAll(params?: { time?: number; icao24?: string[]; bbox?: number[] }) {
    const token = await this.getAccessToken();
    const response = await axios.get(`${OPENSKY_BASE_URL}/states/all`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params,
    });

    const velocitySample = response.data.states.slice(0, 10).map((s: any) => s[9]);
    console.log('Sample velocity values from OpenSky:', velocitySample);
    console.log('Total states:', response.data.states.length);

    const states = response.data.states
      .filter((state: any) => state[5] !== null && state[6] !== null)
      .map((state: any) => ({
        icao24: state[0],
        altitude: state[7] ?? state[13] ?? 0,
        heading: state[10] !== null && state[10] !== undefined ? state[10] * Math.PI / 180 : null,
        lat: state[6],
        lon: state[5],
        timePosition: state[3] * 1000,
        velocity: state[9] ?? 0,
      }));

    return { states };
  }

  async getTracks(icao24: string, time: number = 0) {
    const token = await this.getAccessToken();
    const response = await axios.get(`${OPENSKY_BASE_URL}/tracks/all`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { icao24, time },
    });

    if (response.data.path && Array.isArray(response.data.path)) {
      response.data.path = response.data.path.map((item: any[]) => ({
        time: item[0],
        lat: item[1],
        lon: item[2],
        baro_altitude: item[3],
        true_track: item[4] * Math.PI / 180,
        on_ground: item[5],
      }));
    }

    return response.data;
  }
}

export default new OpenSkyService();
