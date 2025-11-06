export const TOPICS = {
  DISCOVER_BROADCAST: '{broadcastTopic}/discover',
  DIAGNOSE_BROADCAST: '{broadcastTopic}/diagnose',

  DISCOVER_UNICAST: '{topicPrefix}/{deviceId}/discover',
  DIAGNOSE_UNICAST: '{topicPrefix}/{deviceId}/diagnose',

  FIRMWARE_UPGRADE: '{topicPrefix}/{deviceId}/firmware/upgrade',
  HEARTBEAT: '{topicPrefix}/{deviceId}/heartbeat',
  REBOOT: '{topicPrefix}/{deviceId}/reboot',
  SENSOR_CONFIG: '{topicPrefix}/{deviceId}/config',
  SENSOR_ASSIGN: '{topicPrefix}/{deviceId}/assign',
  SENSOR_TELEMETRY: '{topicPrefix}/{deviceId}/telemetry',
  SENSOR_METRICs: '{topicPrefix}/{deviceId}/metrics',
} as const;
