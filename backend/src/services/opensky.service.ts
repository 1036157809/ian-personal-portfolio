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
    return response.data;
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
    return response.data;
  }
}

export default new OpenSkyService();
