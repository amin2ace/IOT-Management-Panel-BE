export enum TopicUseCase {
  // Sensor → Backend
  DISCOVERY = '/discover',
  TELEMETRY = '/telemetry',
  DEVICE_METRICS = '/metrics',
  HEARTBEAT = '/heartbeat',
  DIAGNOSTICS_RESPONSE = '/diagnose',
  FIRMWARE_STATUS = '/firmware/status',

  // Backend → Sensor
  BROADCAST = '/broadcast',
  // DISCOVERY_REQUEST = 'DISCOVERY_REQUEST',
  ASSIGN_DEVICE_FUNCTION = '/assign',
  SENSOR_CONFIGURATION = '/config',
  // NETWORK_CONFIGURATION = 'NETWORK_CONFIGURATION',
  FIRMWARE_UPDATE = '/firmware/upgrade',
  REBOOT_COMMAND = '/reboot',
  // DIAGNOSTIC_REQUEST = 'DIAGNOSTIC_REQUEST',
  // SHADOW_DESIRED = 'SHADOW_DESIRED',
  // COMMAND_QUEUE = 'COMMAND_QUEUE',
}
