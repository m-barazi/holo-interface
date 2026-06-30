export interface TelemetryTick {
  ts: number;
  cpu: number;
  gpu: number;
  ram: number;
  net: {
    up: number;
    down: number;
    latency: number;
    ping: number;
    internet: boolean;
  };
  temp: number;
  energy: number;
  fps: number;
  apiStatus: 'ok' | 'degraded' | 'down';
}