/**
 * 通用 API 响应类型
 */
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export interface FileMetadata {
    id: string;
    name: string;
    size: string;
    type: string;
    filePath: string;
}
export interface AircraftState {
    icao24: string;
    lon: number;
    lat: number;
    heading: number | null;
    velocity: number;
    altitude: number;
    timePosition: number;
}
export interface StatesResponse {
    states: AircraftState[];
}
export interface TrackPoint {
    time: number;
    lat: number;
    lon: number;
    baro_altitude: number;
    true_track: number;
    on_ground: boolean;
}
export interface TracksResponse {
    icao24: string;
    callsign: string;
    startTime: number;
    endTime: number;
    path: TrackPoint[];
}
export interface VisitorStats {
    today: {
        uv: number;
        pv: number;
    };
    total: {
        uv: number;
        pv: number;
    };
    recent7days: Array<{
        date: string;
        uv: number;
        pv: number;
    }>;
}
//# sourceMappingURL=api.d.ts.map