import { UpdateTopicDto } from '../dto/update-topic.dto';
import { TopicUseCase } from '../enum/topic-usecase.enum';
import Topic from '../repository/mqtt-topic.entity';

export interface ITopicService {
  createTopic(deviceId: string, useCase: TopicUseCase): Promise<Topic>;

  createAllTopicsForDevice(deviceId: string): Promise<Topic[]>;

  createDeviceBaseTopic(deviceId: string): Promise<Topic>;

  storeTopic(
    deviceId: string,
    topic: string,
    useCase: TopicUseCase,
  ): Promise<Topic>;

  getBroadcastTopic(): Promise<Topic>;

  getDeviceTopicByUseCase(
    deviceId: string,
    useCase: TopicUseCase,
  ): Promise<Topic>;

  getAllTopicsForOneDevice(deviceId: string): Promise<Topic[]>;

  getTopicByName(topic: string): Promise<Topic>;

  getAllSubscribedTopics(): Promise<Topic[]>;

  updateTopic(topic: string, updateData: UpdateTopicDto): Promise<Topic>;
}
