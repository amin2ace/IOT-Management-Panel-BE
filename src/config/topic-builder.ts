export const buildTopic = {
  discoverBroadcast: (broadcastTopic: string) => `${broadcastTopic}/discover`,

  diagBroadcast: (broadcastTopic: string) => `${broadcastTopic}/diagnose`,

  discoverUnicast: (topicPrefix: string, deviceId: string) =>
    `${topicPrefix}/${deviceId}/discover`,

  diagUnicast: (topicPrefix: string, deviceId: string) =>
    `${topicPrefix}/${deviceId}/diagnose`,

  firmwareUpgrade: (topicPrefix: string, deviceId: string) =>
    `${topicPrefix}/${deviceId}/firmware/upgrade`,

  heartbeat: (topicPrefix: string, deviceId: string) =>
    `${topicPrefix}/${deviceId}/heartbeat`,

  reboot: (topicPrefix: string, deviceId: string) =>
    `${topicPrefix}/${deviceId}/reboot`,

  config: (topicPrefix: string, deviceId: string) =>
    `${topicPrefix}/${deviceId}/config`,

  assign: (topicPrefix: string, deviceId: string) =>
    `${topicPrefix}/${deviceId}/assign`,

  telemetry: (topicPrefix: string, deviceId: string) =>
    `${topicPrefix}/${deviceId}/telemetry`,

  metrics: (topicPrefix: string, deviceId: string) =>
    `${topicPrefix}/${deviceId}/metrics`,
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
