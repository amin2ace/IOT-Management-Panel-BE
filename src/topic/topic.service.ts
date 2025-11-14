import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import MqttTopic from './repository/mqtt-topic.entity';
import { Repository } from 'typeorm';
import { TopicUseCase } from './enum/topic-usecase.enum';
import { ConfigService } from '@nestjs/config';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(MqttTopic)
    private readonly topicRepo: Repository<MqttTopic>,
    private readonly config: ConfigService,
  ) {}

  private readonly logger = new Logger(TopicService.name, { timestamp: true });

  async createTopic(
    deviceId: string,
    useCase: TopicUseCase,
  ): Promise<MqttTopic> {
    const Base_Topic = this.config.getOrThrow<string>('BASE_TOPIC');

    const deviceTopic = `${Base_Topic}/${deviceId}/${useCase}`;

    return await this.storeTopic(deviceId, deviceTopic);
  }

  async createAllTopics(deviceId: string) {
    const Base_Topic = this.config.getOrThrow<string>('BASE_TOPIC');

    for (const useCase of Object.values(TopicUseCase)) {
      let topic = `${Base_Topic}/${deviceId}/${useCase}`;
      await this.storeTopic(deviceId, topic);
    }

    return `All topics for device ${deviceId} was created`;
  }

  async createDeviceBaseTopic(deviceId: string): Promise<MqttTopic> {
    const Base_Topic = this.config.getOrThrow<string>('BASE_TOPIC');

    const deviceTopic = `${Base_Topic}/${deviceId}`;

    return await this.storeTopic(deviceId, deviceTopic);
  }

  async storeTopic(deviceId: string, topic: string): Promise<MqttTopic> {
    const record = this.topicRepo.create({
      deviceId,
      topic,
      isActive: true,
    });

    await this.topicRepo.save(record);
    return record;
  }

  async getBroadcastTopic(): Promise<string> {
    const Base_Topic = this.config.getOrThrow<string>('BASE_TOPIC');
    const broadcastTopic = await this.getTopicByDeviceId(
      'broadcast',
      TopicUseCase.BROADCAST,
    );

    if (!broadcastTopic) {
      this.logger.error('Broadcast topic retrieve failed');
    }
    return `${Base_Topic}/${broadcastTopic}`;
  }

  async getTopicByDeviceId(
    deviceId: string,
    useCase?: TopicUseCase,
  ): Promise<MqttTopic> {
    const topic = await this.topicRepo.findOne({
      where: {
        deviceId,
        useCase,
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return topic;
  }

  async getDeviceTopics(deviceId: string): Promise<MqttTopic[]> {
    const topic = await this.topicRepo.find({
      where: {
        deviceId,
      },
    });

    if (!topic || !topic.length) {
      throw new NotFoundException('No Topic found for device');
    }

    return topic;
  }

  async getTopicByName(topic: string): Promise<MqttTopic> {
    const storedTopic = await this.topicRepo.findOne({
      where: {
        topic,
      },
    });

    if (!storedTopic) {
      throw new NotFoundException('Topic not found');
    }

    return storedTopic;
  }

  async getAllTopics(): Promise<MqttTopic[]> {
    const topics = await this.topicRepo.find({
      where: {
        isActive: true,
      },
    });

    if (!topics.length) {
      throw new NotFoundException('No Topic found');
    }

    return topics;
  }

  async updateTopic(topic, updateData: UpdateTopicDto): Promise<string> {
    try {
      await this.topicRepo.update({ topic }, { ...updateData });
      return 'Topic Updated';
    } catch (error) {
      throw new ForbiddenException('Update topic failed', error);
    }
  }
}
