export enum TelemetryMetric {
  // 🌡 Environment
  Temperature = 'temperature',
  Humidity = 'humidity',
  Pressure = 'pressure',
  AirQuality = 'airQuality',
  CO2 = 'co2',
  VOC = 'voc', // Volatile Organic Compounds
  Noise = 'noise',
  Light = 'light',

  // 🔌 Power & Energy
  Voltage = 'voltage',
  Current = 'current',
  Power = 'power',
  PowerFactor = 'powerFactor',
  EnergyConsumption = 'energyConsumption',

  // 💧 Water & Gas
  WaterFlow = 'waterFlow',
  WaterLevel = 'waterLevel',
  GasLeak = 'gasLeak',
  GasFlow = 'gasFlow',

  // 🚀 Motion & Position
  Accelerometer = 'accelerometer',
  Gyroscope = 'gyroscope',
  Magnetometer = 'magnetometer',
  Vibration = 'vibration',
  Tilt = 'tilt',
  GeoLatitude = 'geoLatitude',
  GeoLongitude = 'geoLongitude',

  // 🏭 Machinery & Equipment
  RPM = 'rpm',
  Torque = 'torque',
  BatteryLevel = 'batteryLevel',
  HeaterState = 'heaterState',
  MotorState = 'motorState',

  // 🔥 Safety & Alerts
  Smoke = 'smoke',
  Flame = 'flame',
  Motion = 'motion',
  DoorState = 'doorState',
  WindowState = 'windowState',

  // 🌱 Agriculture
  SoilMoisture = 'soilMoisture',
  SoilTemperature = 'soilTemperature',
  PH = 'ph',
  EC = 'ec', // Electrical conductivity in soil
}
