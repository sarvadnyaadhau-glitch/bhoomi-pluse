export interface HealthResponse { status: 'ok'; service: string; version: string }
export interface FarmSummary { id: string; name: string; areaAcres: number; cropName: string | null; sensorConnected: boolean }
