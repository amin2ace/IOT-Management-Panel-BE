import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum } from 'class-validator';
import { TopicUseCase } from '../enum/topic-usecase.enum';
import { RequiredStringApiProperty } from '@/common/decorator/api-properties';

export class CreateTopicDto {
  @RequiredStringApiProperty({
    description: 'MQTT broker URL to connect',
    example: 'mqtt://broker.hivemq.com:1883',
  })
  brokerUrl: string;

  @RequiredStringApiProperty({
    description: 'Unique identifier of the device',
    example: 'device-00123',
  })
  deviceId: string;

  @RequiredStringApiProperty({
    description: 'MQTT topic the device publishes or subscribes to',
    example: 'home/device-00123/telemetry',
  })
  topic: string;

  @ApiProperty({
    description:
      'The use case of the topic, determining how the message is handled',
    enum: TopicUseCase,
    example: TopicUseCase.DISCOVERY,
  })
  @IsEnum(TopicUseCase)
  useCase: TopicUseCase;

  @ApiProperty({
    description: 'Flag that determines if the topic listener should be active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}
