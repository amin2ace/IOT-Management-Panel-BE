export type SensorPayloadMap = {
  [SensorType.TEMPERATURE]: TemperaturePayload;
  [SensorType.HUMIDITY]: HumidityPayload;
  [SensorType.PRESSURE]: PressurePayload;
  [SensorType.LIGHT]: LightPayload;
  [SensorType.MOTION]: MotionPayload;
  [SensorType.CO2]: CO2Payload;
  [SensorType.RELAY]: RelayPayload;
  [SensorType.GPS]: GPSPayload;
  [SensorType.AMMONIA]: AmmoniaPayload;
};

// Generic interface for a sensor message
export interface SensorMessage<T extends SensorType = SensorType> {
  sensorType: T;
  topic: string;
  payload: SensorPayloadMap[T];
}
