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

@Injectable()
export class TopicService {
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

    const isTopicExist = await this.topicRepo.findOne({
      where: {
        brokerUrl,
        topic: deviceTopic,
        deviceId,
      },
    });

    if (!isTopicExist) {
      return await this.storeTopic(deviceId, deviceTopic, useCase);
    }
    return isTopicExist;
  }

  async createAllTopics(deviceId: string) {
    const Base_Topic = this.configService.getOrThrow<string>('BASE_TOPIC');

    for (const useCase of Object.values(TopicUseCase)) {
      let topic = `${Base_Topic}/${deviceId}/${useCase}`;
      await this.storeTopic(deviceId, topic, useCase);
    }

    return `All topics for device ${deviceId} was created`;
  }

  async createDeviceBaseTopic(deviceId: string): Promise<Topic> {
    const Base_Topic = this.configService.getOrThrow<string>('BASE_TOPIC');

    const deviceTopic = `${Base_Topic}/${deviceId}`;

    return await this.storeTopic(
      deviceId,
      deviceTopic,
      TopicUseCase.DEVICE_BASE,
    );
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
      });

      await this.topicRepo.save(record);
      return record;
    }
    this.logger.debug('Topic already exists in database');
    return isTopicExist;
  }

  async getBroadcastTopic(): Promise<string> {
    const broadcastTopic = await this.topicRepo.findOne({
      where: {
        useCase: TopicUseCase.BROADCAST,
        isSubscribed: true,
        deviceId: 'Mqtt_Broker',
      },
    });

    if (!broadcastTopic) {
      this.logger.error(
        `Topics:::${broadcastTopic}:::MqttBroker:::retrieve:::failed`,
      );
      throw new NotFoundException('Broadcast topic not found');
    }
    this.MQTT_BROADCAST_DISCOVERY = broadcastTopic?.topic;
    return broadcastTopic.topic;
  }

  async getDeviceTopicsByUseCase(
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
      this.logger.error(
        `Topics:::${useCase}:::${deviceId}:::retrieve:::failed`,
      );
      throw new NotFoundException('Topic not found');
    }
    return topic;
  }

  async getDeviceTopicsByDeviceId(deviceId: string): Promise<Topic[]> {
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

  async updateTopic(topic, updateData: UpdateTopicDto): Promise<string> {
    try {
      await this.topicRepo.update({ topic }, { ...updateData });
      return 'Topic Updated';
    } catch (error) {
      throw new ForbiddenException('Update topic failed', error);
    }
  }
}
