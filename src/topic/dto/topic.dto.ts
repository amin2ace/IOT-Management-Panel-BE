import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { TopicUseCase } from '../enum/topic-usecase.enum';

export class TopicDto {
  @ApiProperty({
    description: 'Topic unique identifier',
    example: '507f1f77bcf86cd799439011',
  })
  @Type(() => String)
  _id: ObjectId;

  @Expose()
  @ApiProperty({
    description: 'MQTT broker URL',
    example: 'mqtt://broker.hivemq.com:1883',
  })
  brokerUrl: string;

  @Expose()
  @ApiProperty({
    description: 'Device ID associated with the topic',
    example: 'device-00123',
  })
  deviceId: string;

  @Expose()
  @ApiProperty({
    description: 'MQTT topic name',
    example: 'home/living-room/temperature',
  })
  topic: string;

  @Expose()
  @ApiProperty({
    description: 'Use case for this topic',
    enum: TopicUseCase,
    example: TopicUseCase.BROADCAST,
  })
  useCase: TopicUseCase;

  @Expose()
  @ApiProperty({
    description: 'Whether the topic is subscribed',
    example: false,
  })
  isSubscribed: boolean;

  @Expose()
  @ApiProperty({
    description: 'Topic creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Topic last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}
