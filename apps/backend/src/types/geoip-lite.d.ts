declare module 'geoip-lite' {
  interface GeoIpLookup {
    country: string;
    region: string;
    city: string;
    ll: [number, number];
    metro: number;
    zip: string;
    timezone: string;
    range?: [number, number];
  }

  export function lookup(ip: string): GeoIpLookup | null;
}
