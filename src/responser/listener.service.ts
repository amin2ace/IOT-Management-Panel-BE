import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisService } from 'src/redis/redis.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ResponserService } from './responser.service';
import {
  AckResponseDto,
  DeviceRebootResponseDto,
  DiscoveryResponseDto,
  FwUpgradeResponseDto,
  HardwareStatusResponseDto,
  HeartbeatDto,
  SensorFunctionalityResponseDto,
  TelemetryResponseDto,
} from './dto';

@Injectable()
export class ListenerService {
  constructor(
    private readonly responserService: ResponserService,
    private readonly redisCache: RedisService,
  ) {}

  private readonly logger = new Logger(ListenerService.name, {
    timestamp: true,
  });

  async transformAndValidate<T>(
    dtoClass: new () => T,
    payload: any,
  ): Promise<T> {
    // 1: Transform and validate DTO
    const dtoInstance = plainToInstance(dtoClass, payload);

    const errors = await validate(dtoInstance as object);
    const { requestId, userId } = dtoInstance as any;

    if (errors.length > 0) {
      const errorString = errors
        .map((e) => JSON.stringify(e.constraints))
        .join(', ');
      this.logger.error(
        `Response Validation failed for requestId=${requestId}: ${errorString}`,
      );
      throw new BadRequestException('Invalid payload');
    }

    // 2: Check Redis cache for pending request
    const cached = await this.redisCache.get(`pending:${requestId}`);
    if (cached === null) {
      throw new BadRequestException(
        'Invalid request id or user id in payload',
        {
          cause: 'sdfg',
        },
      );
    }

    // 3: Check requested id validation
    const {
      requestCode,
      requestId: cachedRequestId,
      userId: cachedUserId,
    } = cached;

    if (cachedRequestId !== requestId || cachedUserId !== userId) {
      throw new BadRequestException('Invalid id in response payload');
    }
    this.logger.debug('Response validated with cache');
    console.log(dtoInstance);
    return dtoInstance;
  }

  // MQTT Broker ---> Web Socket Gateway: Via WebSocket Gateway
  @OnEvent('mqtt/message/discovery')
  async handleDiscoveryEvent(topic: string, payload: any) {
    // TODO: seprate response and request topics by adding /req or /res at topic's end
    if (!topic.endsWith('/discovery') || !payload?.responseId) return;

    const validatedPayload = await this.transformAndValidate(
      DiscoveryResponseDto,
      payload,
    );

    if (validatedPayload.responseId) {
      await this.responserService.handleDiscoveryResponse(validatedPayload);
    }
  }

  @OnEvent('mqtt/message/assign')
  async handleSensorAssignEvent(topic: string, payload: any) {
    if (!topic.endsWith('/assign') || !payload?.responseId) return;

    const validatedPayload = await this.transformAndValidate(
      SensorFunctionalityResponseDto,
      payload,
    );

    await this.responserService.handleAssignResponse(validatedPayload);
  }

  @OnEvent('mqtt/message/ack')
  async handleAckEvent(topic: string, payload: AckResponseDto) {
    if (!topic.endsWith('/ack') && !payload?.responseId) return;

    const validatedPayload = await this.transformAndValidate(
      AckResponseDto,
      payload,
    );

    await this.responserService.handleAckMessage(validatedPayload);
  }

  @OnEvent('mqtt/message/upgrade')
  async handleUpgradeEvent(topic: string, payload: any) {
    if (!topic.endsWith('/upgrade') && !payload?.responseId) return;
    const validatedPayload = await this.transformAndValidate(
      FwUpgradeResponseDto,
      payload,
    );
    await this.responserService.handleUpgradeResponse(validatedPayload);
  }

  @OnEvent('mqtt/message/heartbeat')
  async handleHeartbeatEvent(topic: string, payload: any) {
    if (!topic.endsWith('/heartbeat') && !payload?.responseId) return;

    const validatedPayload = await this.transformAndValidate(
      HeartbeatDto,
      payload,
    );
    await this.responserService.handleDeviceHeartbeat(validatedPayload);
  }

  @OnEvent('mqtt/message/reboot')
  async handleRebootEvent(topic: string, payload: any) {
    if (!topic.endsWith('/reboot') && !payload?.responseId) return;

    const validatedPayload = await this.transformAndValidate(
      DeviceRebootResponseDto,
      payload,
    );
    await this.responserService.handleRebootResponse(validatedPayload);
  }

  @OnEvent('mqtt/message/telemetry')
  async handleTelemetryEvent(topic: string, payload: any) {
    if (!topic.endsWith('/telemetry') && !payload?.responseId) return;

    const validatedPayload = await this.transformAndValidate(
      TelemetryResponseDto,
      payload,
    );
    await this.responserService.handleTelemetryResponse(validatedPayload);
  }

  @OnEvent('mqtt/message/hardware-status')
  async handleMetricsEvent(topic: string, payload: any) {
    if (!topic.endsWith('/hardware_status') && !payload?.responseId) return;

    const validatedPayload = await this.transformAndValidate(
      HardwareStatusResponseDto,
      payload,
    );
    await this.responserService.handleHardwareStatus(validatedPayload);
  }

  // @OnEvent('mqtt/message/alert')
  // async handleAlertEvent(topic: string, payload: any) {
  //   if (!topic.endsWith('/alert') && !payload?.responseId) return;

  //   const validatedPayload = await this.transformAndValidate(AlertDto, payload);

  //   await this.deviceService.handleDeviceAlert(payload);
  // }

  @OnEvent('mqtt/message/unknown')
  async handleUnknownEvent(topic: string, payload: any) {
    await this.responserService.handleUnknownMessage(payload);
  }
}
