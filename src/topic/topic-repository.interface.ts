/**
 * ITopicRepository Interface
 *
 * Abstraction for topic persistence operations
 * Decouples MQTT client service from TopicService implementation
 * Follows Dependency Inversion Principle
 */

import { TopicUseCase } from '@/topic/enum/topic-usecase.enum';
import { UpdateTopicDto } from '@/topic/dto/update-topic.dto';

export interface ITopic {
  topic: string;
  isSubscribed: boolean;
  useCase: TopicUseCase;
  createdAt: Date;
}

export interface ITopicRepository {
  /**
   * Creates a new topic in the repository
   * @param topicName - Name of the topic
   * @param useCase - Topic use case classification
   * @returns Created topic object
   * @throws Error if creation fails
   */
  createTopic(topicName: string, useCase: TopicUseCase): Promise<ITopic>;

  /**
   * Updates topic information
   * @param topicPath - Topic path/name
   * @param updates - Partial updates to apply
   * @throws Error if update fails
   */
  updateTopic(
    topicPath: string,
    updates: Partial<UpdateTopicDto>,
  ): Promise<void>;

  /**
   * Retrieves all topics marked as subscribed
   * @returns Array of subscribed topics
   * @throws Error if retrieval fails
   */
  getAllSubscribedTopics(): Promise<ITopic[]>;

  /**
   * Retrieves a single topic by path
   * @param topicPath - Topic path/name
   * @returns Topic object or null if not found
   */
  getTopic(topicPath: string): Promise<ITopic | null>;

  /**
   * Deletes a topic
   * @param topicPath - Topic path/name
   * @throws Error if deletion fails
   */
  deleteTopic(topicPath: string): Promise<void>;
}
