import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DeviceService } from './device.service';
import {
  AckResponseDto,
  DeviceRebootResponseDto,
  DiscoveryResponseDto,
  FwUpgradeResponseDto,
  HeartbeatDto,
  SensorMetricDto,
} from './messages';
import { TelemetryDto } from './messages/listening/telemetry.response.dto';

@Injectable()
export class DeviceListener {
  constructor(private readonly deviceService: DeviceService) {}

  private readonly logger = new Logger(DeviceListener.name, {
    timestamp: true,
  });

  // Listen for MQTT discovery topic like: "sensors/+/discovery"
  @OnEvent('mqtt/message/discovery')
  async handleDiscoveryEvent(topic: string, payload: DiscoveryResponseDto) {
    if (!topic.endsWith('/discovery')) return;
    await this.deviceService.storeSensorInDatabase(payload);
  }

  @OnEvent('mqtt/message/ack')
  async handleAckEvent(topic: string, payload: AckResponseDto) {
    if (!topic.endsWith('/ack')) return;
    await this.deviceService.handleAckMessage(payload);
  }

  @OnEvent('mqtt/message/upgrade')
  async handleUpgradeEvent(topic: string, payload: FwUpgradeResponseDto) {
    if (!topic.endsWith('/upgrade')) return;
    await this.deviceService.handleUpgradeResponse(payload);
  }

  @OnEvent('mqtt/message/heartbeat')
  async handleHeartbeatEvent(topic: string, payload: HeartbeatDto) {
    if (!topic.endsWith('/heartbeat')) return;
    await this.deviceService.handleDeviceHeartbeat(payload);
  }

  @OnEvent('mqtt/message/reboot')
  async handleRebootEvent(topic: string, payload: DeviceRebootResponseDto) {
    if (!topic.endsWith('/reboot')) return;
    await this.deviceService.handleRebootResponse(payload);
  }

  @OnEvent('mqtt/message/telemetry')
  async handleTelemetryEvent(topic: string, payload: TelemetryDto) {
    if (!topic.endsWith('/telemetry')) return;
    await this.deviceService.handleSensorTelemetry(payload);
  }

  @OnEvent('mqtt/message/metrics')
  async handleMetricsEvent(topic: string, payload: SensorMetricDto) {
    if (!topic.endsWith('/metrics')) return;
    await this.deviceService.handleDeviceMetrics(payload);
  }

  // @OnEvent('mqtt/message/alert')
  // async handleAlertEvent(topic: string, payload: AlertDto) {
  //   if (!topic.endsWith('/alert')) return;
  //   await this.deviceService.handleDeviceAlert(payload);
  // }

  @OnEvent('mqtt/message/unknown')
  async handleUnknownEvent(topic: string, payload: any) {
    await this.deviceService.handleAckMessage(payload);
  }
}
