import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Topic from './repository/mqtt-topic.entity';
import { Repository } from 'typeorm';
import { TopicUseCase } from './enum/topic-usecase.enum';
import { ConfigService } from '@nestjs/config';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { MqttClientService } from 'src/mqtt-client/mqtt-client.service';
import { ITopicService } from './interface/topic-service.interface';

@Injectable()
export class TopicService implements ITopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepo: Repository<Topic>,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(TopicService.name, { timestamp: true });
  public MQTT_BROADCAST_DISCOVERY = '';

  async createTopic(deviceId: string, useCase: TopicUseCase): Promise<Topic> {
    const Base_Topic = this.configService.getOrThrow<string>('BASE_TOPIC');

    const brokerUrl =
      await this.configService.getOrThrow<string>('MQTT_BROKER_URL');

    const deviceTopic = `${Base_Topic}/${deviceId}/${useCase}`;

    const storedTopic = await this.topicRepo.findOne({
      where: {
        brokerUrl,
        topic: deviceTopic,
        deviceId,
      },
    });

    if (!storedTopic) {
      return await this.storeTopic(deviceId, deviceTopic, useCase);
    }
    return storedTopic;
  }

  async createAllTopicsForDevice(deviceId: string): Promise<Topic[]> {
    const topics: Topic[] = [];
    const baseTopic = await this.createDeviceBaseTopic(deviceId);
    topics.push(baseTopic);
    for (const useCase of Object.values(TopicUseCase)) {
      const topic = await this.createTopic(deviceId, useCase);
      topics.push(topic);
    }

    return topics;
  }

  async createDeviceBaseTopic(deviceId: string): Promise<Topic> {
    const Base_Topic = this.configService.getOrThrow<string>('BASE_TOPIC');

    const deviceTopic = `${Base_Topic}/${deviceId}`;

    const topic = await this.storeTopic(
      deviceId,
      deviceTopic,
      TopicUseCase.DEVICE_BASE,
    );

    return topic;
  }

  async storeTopic(
    deviceId: string,
    topic: string,
    useCase: TopicUseCase,
  ): Promise<Topic> {
    const brokerUrl =
      await this.configService.getOrThrow<string>('MQTT_BROKER_URL');

    const isTopicExist = await this.topicRepo.findOne({
      where: {
        topic,
        useCase,
        deviceId,
      },
    });

    if (!isTopicExist) {
      const record = this.topicRepo.create({
        brokerUrl,
        deviceId,
        topic,
        useCase,
        isSubscribed: true,
      });

      await this.topicRepo.save(record);
    }
    return await this.getTopicByName(topic);
  }

  async getBroadcastTopic(): Promise<Topic> {
    const broadcastTopic = await this.topicRepo.findOne({
      where: {
        useCase: TopicUseCase.BROADCAST,
        isSubscribed: true,
        deviceId: 'Mqtt_Broker',
      },
    });

    if (!broadcastTopic) {
      throw new NotFoundException('Broadcast topic not found');
    }
    // this.MQTT_BROADCAST_DISCOVERY = broadcastTopic?.topic;
    return broadcastTopic;
  }

  async getDeviceTopicByUseCase(
    deviceId: string,
    useCase: TopicUseCase,
  ): Promise<Topic> {
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

  async getAllTopicsForOneDevice(deviceId: string): Promise<Topic[]> {
    const topics = await this.topicRepo.find({
      where: {
        deviceId,
      },
    });

    if (!topics || !topics.length) {
      throw new NotFoundException('No Topic found for device');
    }

    return topics;
  }

  async getTopicByName(topic: string): Promise<Topic> {
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

  async getAllSubscribedTopics(): Promise<Topic[]> {
    const topics = await this.topicRepo.find({
      where: {
        isSubscribed: true,
      },
    });

    if (!topics.length) {
      throw new NotFoundException('No Topic found');
    }

    return topics;
  }

  async updateTopic(topic: string, updateData: UpdateTopicDto): Promise<Topic> {
    try {
      await this.topicRepo.update({ topic }, { ...updateData });
      const updatedTopic = await this.topicRepo.findOne({
        where: {
          topic,
        },
      });
      if (!updatedTopic) {
        throw new ForbiddenException('Update topic failed');
      }
      return updatedTopic;
    } catch (error) {
      throw new ForbiddenException('Update topic failed', error);
    }
  }
}
