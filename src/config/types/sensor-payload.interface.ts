import { DeviceCapabilities } from '../enum/sensor-type.enum';
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
  [DeviceCapabilities.TEMPERATURE]: TemperaturePayload;
  [DeviceCapabilities.HUMIDITY]: HumidityPayload;
  [DeviceCapabilities.PRESSURE]: PressurePayload;
  [DeviceCapabilities.LIGHT]: LightPayload;
  [DeviceCapabilities.MOTION]: MotionPayload;
  [DeviceCapabilities.CO2]: CO2Payload;
  [DeviceCapabilities.RELAY]: RelayPayload;
  [DeviceCapabilities.GPS]: GPSPayload;
  [DeviceCapabilities.AMMONIA]: AmmoniaPayload;
};

// Generic interface for a sensor message
export interface SensorMessage<
  T extends DeviceCapabilities = DeviceCapabilities,
> {
  sensorType: T;
  topic: string;
  payload: SensorPayloadMap[T];
}
