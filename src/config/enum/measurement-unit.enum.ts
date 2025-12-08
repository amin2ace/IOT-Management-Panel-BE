import { DeviceCapabilities } from './sensor-type.enum';

export enum MeasurementUnit {
  // Temperature
  CELSIUS = '°C',
  FAHRENHEIT = '°F',
  KELVIN = 'K',

  // Humidity
  PERCENTAGE = '%',
  RELATIVE_HUMIDITY = '%RH',

  // Pressure
  PASCAL = 'Pa',
  HECTOPASCAL = 'hPa',
  MILLIBAR = 'mbar',
  BAR = 'bar',
  PSI = 'psi',
  ATMOSPHERE = 'atm',
  MMHG = 'mmHg',
  INHG = 'inHg',

  // Light
  LUX = 'lx',
  FOOT_CANDLE = 'fc',
  LUMEN = 'lm',
  CANDELA = 'cd',

  // Motion/Position
  METER = 'm',
  CENTIMETER = 'cm',
  MILLIMETER = 'mm',
  INCH = 'in',
  FOOT = 'ft',
  DEGREE = '°',
  RADIAN = 'rad',

  // Gas Concentration
  PARTS_PER_MILLION = 'ppm',
  PARTS_PER_BILLION = 'ppb',
  PARTS_PER_TRILLION = 'ppt',
  MILLIGRAMS_PER_CUBIC_METER = 'mg/m³',
  MICROGRAMS_PER_CUBIC_METER = 'µg/m³',
  PERCENT_VOLUME = '% vol',

  // Electrical
  VOLT = 'V',
  MILLIVOLT = 'mV',
  AMPERE = 'A',
  MILLIAMPERE = 'mA',
  MICROAMPERE = 'µA',
  WATT = 'W',
  MILLIWATT = 'mW',
  KILOWATT = 'kW',
  OHM = 'Ω',
  KILOHM = 'kΩ',
  MEGOHM = 'MΩ',
  HERTZ = 'Hz',
  KILOHERTZ = 'kHz',
  MEGAHERTZ = 'MHz',

  // Time/Duration
  SECOND = 's',
  MILLISECOND = 'ms',
  MICROSECOND = 'µs',
  MINUTE = 'min',
  HOUR = 'h',
  DAY = 'day',

  // Digital/Control
  COUNT = 'count',
  STATE = 'state',
  BOOLEAN = 'bool',
  PERCENT_DUTY_CYCLE = '% duty',

  // Custom/No Unit
  NONE = '',
  CUSTOM = 'custom',
  UNKNOWN = 'unknown',
}

// Optional: Helper function to get default unit for each capability
export function getDefaultUnitForSensor(
  capability: DeviceCapabilities,
): MeasurementUnit {
  switch (capability) {
    case DeviceCapabilities.TEMPERATURE:
      return MeasurementUnit.CELSIUS;

    case DeviceCapabilities.HUMIDITY:
      return MeasurementUnit.PERCENTAGE;

    case DeviceCapabilities.PRESSURE:
      return MeasurementUnit.HECTOPASCAL;

    case DeviceCapabilities.LIGHT:
      return MeasurementUnit.LUX;

    case DeviceCapabilities.MOTION:
      return MeasurementUnit.COUNT;

    case DeviceCapabilities.CO2:
      return MeasurementUnit.PARTS_PER_MILLION;

    case DeviceCapabilities.RELAY:
      return MeasurementUnit.STATE;

    case DeviceCapabilities.GPS:
      return MeasurementUnit.DEGREE;

    case DeviceCapabilities.AMMONIA:
      return MeasurementUnit.PARTS_PER_MILLION;

    default:
      return MeasurementUnit.UNKNOWN;
  }
}

// Optional: Type for unit mapping per capability
export interface SensorUnitMap {
  [DeviceCapabilities.TEMPERATURE]:
    | MeasurementUnit.CELSIUS
    | MeasurementUnit.FAHRENHEIT
    | MeasurementUnit.KELVIN;
  [DeviceCapabilities.HUMIDITY]:
    | MeasurementUnit.PERCENTAGE
    | MeasurementUnit.RELATIVE_HUMIDITY;
  [DeviceCapabilities.PRESSURE]:
    | MeasurementUnit.PASCAL
    | MeasurementUnit.HECTOPASCAL
    | MeasurementUnit.MILLIBAR
    | MeasurementUnit.BAR
    | MeasurementUnit.PSI;
  [DeviceCapabilities.LIGHT]:
    | MeasurementUnit.LUX
    | MeasurementUnit.FOOT_CANDLE
    | MeasurementUnit.LUMEN;
  [DeviceCapabilities.MOTION]: MeasurementUnit.COUNT | MeasurementUnit.BOOLEAN;
  [DeviceCapabilities.CO2]:
    | MeasurementUnit.PARTS_PER_MILLION
    | MeasurementUnit.PARTS_PER_BILLION;
  [DeviceCapabilities.RELAY]: MeasurementUnit.STATE | MeasurementUnit.BOOLEAN;
  [DeviceCapabilities.GPS]: MeasurementUnit.DEGREE | MeasurementUnit.METER;
  [DeviceCapabilities.AMMONIA]:
    | MeasurementUnit.PARTS_PER_MILLION
    | MeasurementUnit.PARTS_PER_BILLION
    | MeasurementUnit.MILLIGRAMS_PER_CUBIC_METER;
}

// Usage example in your DTO/Entity:
// export class SensorReadingDto {
//   @ApiProperty({ enum: MeasurementUnit, example: MeasurementUnit.CELSIUS })
//   unit: MeasurementUnit;

//   value: number;
//   capability: DeviceCapabilities;

//   constructor(
//     capability: DeviceCapabilities,
//     value: number,
//     unit?: MeasurementUnit,
//   ) {
//     this.capability = capability;
//     this.value = value;
//     this.unit = unit || getDefaultUnitForCapability(capability);
//   }
// }

// // Example usage:
// const temperatureReading = new SensorReadingDto(
//   DeviceCapabilities.TEMPERATURE,
//   25.5,
//   MeasurementUnit.CELSIUS,
// );

// const humidityReading = new SensorReadingDto(
//   DeviceCapabilities.HUMIDITY,
//   65.2,
// Unit defaults to MeasurementUnit.PERCENTAGE
// );
