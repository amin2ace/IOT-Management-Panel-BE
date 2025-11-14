export interface TemperaturePayload {
  value: number; // -50 to 100
  timestamp: number;
}

export interface HumidityPayload {
  value: number; // 0 to 100
  timestamp: number;
}

export interface PressurePayload {
  value: number; // 300 to 1100 hPa
  timestamp: number;
}

export interface LightPayload {
  value: number; // 0 to 100000 lux
  timestamp: number;
}

export interface MotionPayload {
  detected: boolean;
  timestamp: number;
}

export interface CO2Payload {
  value: number; // 0 to 5000 ppm
  timestamp: number;
}

export interface RelayPayload {
  state: 'ON' | 'OFF';
  timestamp: number;
}

export interface GPSPayload {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface AmmoniaPayload {
  value: number; // 0 to 500 ppm
  timestamp: number;
}
