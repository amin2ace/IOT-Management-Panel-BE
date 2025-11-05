// src/config/enum/diagnostic-level.enum.ts

export enum DiagnosticLevel {
  BASIC = 'basic', // Minimal checks (connectivity, uptime)
  STANDARD = 'standard', // Includes basic + key sensors
  FULL = 'full', // Complete system check (network, sensors, memory, MQTT, firmware)
  DEEP = 'deep', // Extended diagnostics including stress tests and OTA readiness
}
