import { UpdateTopicDto } from '../dto/update-topic.dto';
import { TopicUseCase } from '../enum/topic-usecase.enum';
import Topic from '../repository/mqtt-topic.entity';

export interface ITopicService {
  /**
   * Create a topic based on device id and use case of the
   * topic to publish messages
   * @param deviceId
   * @param useCase
   */
  createTopic(deviceId: string, useCase: TopicUseCase): Promise<Topic>;
  /**
   * Generate all topics required for a device to publish
   * different messages
   * @param deviceId
   */
  createAllTopicsForDevice(deviceId: string): Promise<Topic[]>;
  /**
   * Creates base topic for a device to differentiate the
   * catagories of the messages
   * @param deviceId
   */
  createDeviceBaseTopic(deviceId: string): Promise<Topic>;
  /**
   * Store and presist the device's topic in database
   * @param deviceId
   * @param topic
   * @param useCase
   */
  storeTopic(
    deviceId: string,
    topic: string,
    useCase: TopicUseCase,
  ): Promise<Topic>;
  /**
   * Get the topic of the device for broadcast uses
   */
  getBroadcastTopic(): Promise<Topic>;
  /**
   * Get a topic of device for specific use case
   * @param deviceId
   * @param useCase
   */
  getDeviceTopicByUseCase(
    deviceId: string,
    useCase: TopicUseCase,
  ): Promise<Topic>;
  /**
   * Retrieve all topics of the device
   * @param deviceId
   */
  getAllTopicsForOneDevice(deviceId: string): Promise<Topic[]>;
  /**
   * Get topic by the name of it
   * @param topic
   */
  getTopicByName(topic: string): Promise<Topic>;
  /**
   * Get all the topics that have been subscribed
   */
  getAllSubscribedTopics(): Promise<Topic[]>;
  /**
   * Edit the topic
   * @param topic
   * @param updateData
   */
  updateTopic(topic: string, updateData: UpdateTopicDto): Promise<Topic>;
}
