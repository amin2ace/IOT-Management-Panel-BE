export const TOPIC = {
  DISCOVER_BROADCAST: 'devices/discover',
  DISCOVER_UNICAST: 'devices/{deviceId}/discover',
  DEVICE_CAPABILITIES: 'devices/{deviceId}/capabilities',
  DEVICE_ASSIGN: 'devices/{deviceId}/assign',
  DEVICE_CONFIG: 'devices/{deviceId}/config',
  SENSOR_TELEMETRY: 'sensors/{clientId}/{type}/{deviceId}',
  DEVICE_STATUS: 'devices/{deviceId}/status',
  FIRMWARE_UPDATE: 'devices/{deviceId}/firmware/update',
} as const;

export const buildTopic = {
  deviceCapabilities: (deviceId: string) => `devices/${deviceId}/capabilities`,
  discoverBroadcast: () => `devices/discover`,
  discoverUnicast: (deviceId: string) => `devices/${deviceId}/discover`,
  assign: (deviceId: string) => `devices/${deviceId}/assign`,
  telemetry: (clientId: string, type: string, deviceId: string) =>
    `sensors/${clientId}/${type}/${deviceId}`,
};

// For parsing incoming topics
export const matchesTopic = (pattern: string, topic: string): boolean => {
  const regex = new RegExp(
    '^' +
      pattern
        .replace('{deviceId}', '([^/]+)')
        .replace('{clientId}', '([^/]+)')
        .replace('{type}', '([^/]+)') +
      '$',
  );
  return regex.test(topic);
};
