import {
  RequiredNumberApiProperty,
  RequiredStringApiProperty,
} from '@/common/decorator/api-properties';
import { QoS } from '@/config/types/mqtt-qos.types';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

/**
 * DTO for publishing messages to MQTT topics
 * @description Used to structure the data required to publish a message
 * to a specified MQTT topic with defined QoS and retain settings
 */
export class MqttPublishDto {
  @RequiredStringApiProperty({ default: 'test/topic' })
  topic: string;

  @ApiProperty({
    default: 'Test Message',
    description:
      'Message payload - can be plain text or JSON formatted string/object',
    oneOf: [
      { type: 'string', example: 'Simple text message' },
      { type: 'string', example: '{"temperature": 25.5, "humidity": 60}' },
      { type: 'object', example: { temperature: 25.5, humidity: 60 } },
    ],
  })
  @IsNotEmpty()
  message: string | Record<string, any>;

  @RequiredNumberApiProperty({ enum: QoS, default: QoS.AtMostOnce })
  qos: QoS;

  @ApiProperty({ type: 'boolean', default: false })
  @IsBoolean()
  @IsNotEmpty()
  retain: boolean;
}
