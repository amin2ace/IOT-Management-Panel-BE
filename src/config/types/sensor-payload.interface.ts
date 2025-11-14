import { SensorType } from '../enum/sensor-type.enum';
import {
  AmmoniaPayload,
  CO2Payload,
  GPSPayload,
  HumidityPayload,
  LightPayload,
  MotionPayload,
  PressurePayload,
  RelayPayload,
  TemperaturePayload,
} from './sensor-type.interface';

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
