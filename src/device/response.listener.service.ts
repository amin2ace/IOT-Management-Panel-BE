import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DeviceService } from './device.service';
import {
  AckResponseDto,
  DeviceRebootResponseDto,
  DiscoveryResponseDto,
  FwUpgradeResponseDto,
  HeartbeatDto,
  HardwareStatusResponseDto,
} from './messages';
import { TelemetryResponseDto } from './messages/listening/telemetry.response.dto';
import { RedisService } from 'src/redis/redis.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SensorFunctionalityResponseDto } from './messages/listening/sensor-functionality.response.dto';
import { ResponseHandlerService } from './response.handler.service';
import { TopicService } from 'src/topic/topic.service';

@Injectable()
export class ResponseListenerService {
  constructor(
    private readonly responseService: ResponseHandlerService,
    private readonly deviceService: DeviceService,
    private readonly topicService: TopicService,
    private readonly redisCache: RedisService,
  ) {}

  private readonly logger = new Logger(ResponseListenerService.name, {
    timestamp: true,
  });

  async transformAndValidate<T>(
    dtoClass: new () => T,
    payload: any,
  ): Promise<T> {
    // 1: Transform and validate DTO
    const dtoInstance = plainToInstance(dtoClass, payload);

    const errors = await validate(dtoInstance as object);
    const { requestId, deviceId } = dtoInstance as any;

    if (errors.length > 0) {
      const errorString = errors
        .map((e) => JSON.stringify(e.constraints))
        .join(', ');
      Logger.error(
        `Validation failed for requestId=${requestId}: ${errorString}`,
      );
      throw new BadRequestException('Invalid payload');
    }

    // 2: Check Redis cache for pending request
    const cached = await this.redisCache.get(`pending:${requestId}`);
    if (!cached) {
      this.logger.warn(`No pending request found for requestId=${requestId}`);
      throw new BadRequestException('Invalid request id in payload');
    }

    // 3: Check requested id validation
    const {
      requestId: cachedRequestId,
      deviceId: cachedDeviceId,
      userId,
    } = cached;
    if (cachedRequestId !== requestId) {
      this.logger.warn('Invalid request id in response payload');
    }

    if (cachedDeviceId !== deviceId) {
      this.logger.warn('Invalid device id in response payload');
    }
    return dtoInstance;
  }

  // Listen for MQTT discovery topic like: "sensors/+/discovery"
  @OnEvent('/discovery')
  async handleDiscoveryEvent(topic: string, payload: any) {
    if (!topic.endsWith('/discovery')) return;

    const validatedPayload = await this.transformAndValidate(
      DiscoveryResponseDto,
      payload,
    );

    await this.responseService.handleDiscoveryResponse(validatedPayload);
  }

  @OnEvent('/assign')
  async handleSensorAssignEvent(topic: string, payload: any) {
    if (!topic.endsWith('/assign')) return;

    const validatedPayload = await this.transformAndValidate(
      SensorFunctionalityResponseDto,
      payload,
    );

    await this.responseService.handleAssignResponse(validatedPayload);
  }

  @OnEvent('mqtt/message/ack')
  async handleAckEvent(topic: string, payload: AckResponseDto) {
    if (!topic.endsWith('/ack')) return;

    const validatedPayload = await this.transformAndValidate(
      AckResponseDto,
      payload,
    );

    await this.responseService.handleAckMessage(validatedPayload);
  }

  @OnEvent('mqtt/message/upgrade')
  async handleUpgradeEvent(topic: string, payload: any) {
    if (!topic.endsWith('/upgrade')) return;
    const validatedPayload = await this.transformAndValidate(
      FwUpgradeResponseDto,
      payload,
    );
    await this.responseService.handleUpgradeResponse(validatedPayload);
  }

  @OnEvent('mqtt/message/heartbeat')
  async handleHeartbeatEvent(topic: string, payload: any) {
    if (!topic.endsWith('/heartbeat')) return;

    const validatedPayload = await this.transformAndValidate(
      HeartbeatDto,
      payload,
    );
    await this.responseService.handleDeviceHeartbeat(validatedPayload);
  }

  @OnEvent('mqtt/message/reboot')
  async handleRebootEvent(topic: string, payload: any) {
    if (!topic.endsWith('/reboot')) return;

    const validatedPayload = await this.transformAndValidate(
      DeviceRebootResponseDto,
      payload,
    );
    await this.responseService.handleRebootResponse(validatedPayload);
  }

  @OnEvent('mqtt/message/telemetry')
  async handleTelemetryEvent(topic: string, payload: any) {
    if (!topic.endsWith('/telemetry')) return;

    const validatedPayload = await this.transformAndValidate(
      TelemetryResponseDto,
      payload,
    );
    await this.responseService.handleTelemetryResponse(validatedPayload);
  }

  @OnEvent('mqtt/message/hardware-status')
  async handleMetricsEvent(topic: string, payload: any) {
    if (!topic.endsWith('/hardware_status')) return;

    const validatedPayload = await this.transformAndValidate(
      HardwareStatusResponseDto,
      payload,
    );
    await this.responseService.handleHardwareStatus(validatedPayload);
  }

  // @OnEvent('mqtt/message/alert')
  // async handleAlertEvent(topic: string, payload: any) {
  //   if (!topic.endsWith('/alert')) return;

  //   const validatedPayload = await this.transformAndValidate(AlertDto, payload);

  //   await this.deviceService.handleDeviceAlert(payload);
  // }

  @OnEvent('mqtt/message/unknown')
  async handleUnknownEvent(topic: string, payload: any) {
    await this.responseService.handleUnknownMessage(payload);
  }
}
