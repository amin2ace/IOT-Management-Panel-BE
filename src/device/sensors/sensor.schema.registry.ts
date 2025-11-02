import {
  TemperatureSchema,
  HumiditySchema,
  PressureSchema,
  LightSchema,
  GPSSchema,
  CO2Schema,
  MotionSchema,
  AmmoniaSchema,
  RelayCommandSchema,
} from './index';

export const SensorSchemaRegistry = {
  temperature: TemperatureSchema,
  humidity: HumiditySchema,
  pressure: PressureSchema,
  lux: LightSchema,
  MotionSchema: MotionSchema,
  gps: GPSSchema,
  co2: CO2Schema,
  ammonia: AmmoniaSchema,
  relay: RelayCommandSchema,
};
