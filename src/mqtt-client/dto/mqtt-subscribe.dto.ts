import { DeviceIdProperty } from '@/common/decorator/api-properties';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for subscribing to MQTT topics for a specific device
 * @description Used to establish subscriptions to one or more MQTT topics
 * associated with a device. Supports wildcard patterns like 'sensors/+/temperature'
 */
export class MqttSubscribeDto {
  @ApiProperty({
    description: 'Array of MQTT topics to subscribe to',
    type: [String],
    example: ['sensors/device-001/temperature', 'sensors/device-001/humidity'],
    isArray: true,
    minItems: 1,
    items: {
      type: 'string',
      description:
        'MQTT topic path. Supports wildcards: + (single level) and # (multi-level)',
      example: 'sensors/+/telemetry',
    },
  })
  @IsString({ each: true })
  @IsArray()
  @IsNotEmpty()
  topics: string[];

  @DeviceIdProperty()
  deviceId: string;
}
