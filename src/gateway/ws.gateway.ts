// import {
//   WebSocketGateway,
//   WebSocketServer,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   SubscribeMessage,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { Logger, Inject } from '@nestjs/common';
// import { MqttGatewayService } from './gateway.service';
// import { EventEmitter2 } from '@nestjs/event-emitter';
// import {
//   DiscoveryResponseDto,
//   SensorFunctionalityResponseDto,
//   AckResponseDto,
//   FwUpgradeResponseDto,
//   HeartbeatDto,
//   DeviceRebootResponseDto,
//   TelemetryResponseDto,
//   HardwareStatusResponseDto,
// } from '../device/messages';

// @WebSocketGateway(30005, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:3001',
//     credentials: true,
//   },
//   namespace: '/mqtt',
// })
// export class MqttGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server;

//   private readonly logger = new Logger(MqttGateway.name);
//   private connectedClients = new Map<string, Socket>();
//   private clientSubscriptions = new Map<string, Set<string>>();

//   constructor(
//     private readonly mqttGatewayService: MqttGatewayService,
//     private readonly eventEmitter: EventEmitter2,
//   ) {
//     this.setupEventListeners();
//   }

//   /**
//    * Setup event listeners for MQTT responses
//    * These will be emitted by the ResponseListenerService
//    */
//   private setupEventListeners(): void {
//     // Device Discovery Event
//     this.eventEmitter.on('/ws/discovery', (payload: DiscoveryResponseDto) => {
//       this.broadcastDeviceDiscovery(payload);
//     });

//     // Device Assignment Event
//     this.eventEmitter.on(
//       '/assign',
//       (payload: SensorFunctionalityResponseDto) => {
//         this.broadcastDeviceAssignment(payload);
//       },
//     );

//     // ACK Event
//     this.eventEmitter.on('mqtt/message/ack', (payload: AckResponseDto) => {
//       this.broadcastAcknowledgment(payload);
//     });

//     // Firmware Upgrade Event
//     this.eventEmitter.on(
//       'mqtt/message/upgrade',
//       (payload: FwUpgradeResponseDto) => {
//         this.broadcastFirmwareUpgrade(payload);
//       },
//     );

//     // Heartbeat Event
//     this.eventEmitter.on('mqtt/message/heartbeat', (payload: HeartbeatDto) => {
//       this.broadcastHeartbeat(payload);
//     });

//     // Device Reboot Event
//     this.eventEmitter.on(
//       'mqtt/message/reboot',
//       (payload: DeviceRebootResponseDto) => {
//         this.broadcastReboot(payload);
//       },
//     );

//     // Telemetry Event
//     this.eventEmitter.on(
//       'mqtt/message/telemetry',
//       (payload: TelemetryResponseDto) => {
//         this.broadcastTelemetry(payload);
//       },
//     );

//     // Hardware Status Event
//     this.eventEmitter.on(
//       'mqtt/message/hardware-status',
//       (payload: HardwareStatusResponseDto) => {
//         this.broadcastHardwareStatus(payload);
//       },
//     );
//   }

//   // Handle new client connections
//   async handleConnection(client: Socket) {
//     const clientId = client.id;
//     this.connectedClients.set(clientId, client);
//     this.clientSubscriptions.set(clientId, new Set());

//     this.logger.log(`Client connected: ${clientId}`);
//     this.logger.log(`Total clients: ${this.connectedClients.size}`);

//     try {
//       // Send current MQTT status to newly connected client
//       const status = await this.mqttGatewayService.getMqttStatus();
//       client.emit('mqtt-status', status);

//       // Send recent sensor data if available
//       const recentData = await this.mqttGatewayService.getRecentSensorData();
//       client.emit('sensor-data-batch', recentData);
//     } catch (error) {
//       this.logger.error(`Error during client connection: ${error.message}`);
//       client.emit('connection-error', {
//         error: 'Failed to initialize connection',
//         timestamp: new Date(),
//       });
//     }
//   }

//   // Handle client disconnections
//   handleDisconnect(client: Socket) {
//     const clientId = client.id;
//     this.connectedClients.delete(clientId);
//     this.clientSubscriptions.delete(clientId);

//     this.logger.log(`Client disconnected: ${clientId}`);
//     this.logger.log(`Total clients: ${this.connectedClients.size}`);
//   }

//   // Client requests to subscribe to specific sensor topics
//   @SubscribeMessage('subscribe-sensor')
//   async handleSubscribeSensor(
//     client: Socket,
//     payload: { sensorId: string; topics: string[] },
//   ) {
//     try {
//       const { sensorId, topics } = payload;

//       // Validate input
//       if (!topics || topics.length === 0) {
//         throw new Error('At least one topic is required');
//       }

//       // Forward subscription to MQTT broker
//       await this.mqttGatewayService.subscribeToTopics(topics, sensorId);

//       // Track client subscription
//       const subscriptions = this.clientSubscriptions.get(client.id);
//       if (subscriptions) {
//         topics.forEach((topic) => subscriptions.add(topic));
//       }

//       // Acknowledge subscription
//       client.emit('subscription-confirmed', {
//         sensorId,
//         topics,
//         timestamp: new Date(),
//       });

//       this.logger.log(
//         `Client ${client.id} subscribed to sensor ${sensorId}, topics: ${topics.join(', ')}`,
//       );
//     } catch (error) {
//       this.logger.error(`Subscription error: ${error.message}`);
//       client.emit('subscription-error', {
//         error: error.message,
//         timestamp: new Date(),
//       });
//     }
//   }

//   // Subscribe to device discovery messages
//   @SubscribeMessage('subscribe-discovery')
//   async handleSubscribeDiscovery(client: Socket) {
//     try {
//       client.emit('discovery-subscribed', {
//         status: 'subscribed',
//         timestamp: new Date(),
//       });
//       this.logger.log(`Client ${client.id} subscribed to discovery events`);
//     } catch (error) {
//       this.logger.error(`Discovery subscription error: ${error.message}`);
//       client.emit('subscription-error', {
//         error: error.message,
//         timestamp: new Date(),
//       });
//     }
//   }

//   // Subscribe to device assignment messages
//   @SubscribeMessage('subscribe-assignment')
//   async handleSubscribeAssignment(client: Socket) {
//     try {
//       client.emit('assignment-subscribed', {
//         status: 'subscribed',
//         timestamp: new Date(),
//       });
//       this.logger.log(`Client ${client.id} subscribed to assignment events`);
//     } catch (error) {
//       this.logger.error(`Assignment subscription error: ${error.message}`);
//       client.emit('subscription-error', {
//         error: error.message,
//         timestamp: new Date(),
//       });
//     }
//   }

//   // Subscribe to acknowledgment messages
//   @SubscribeMessage('subscribe-ack')
//   async handleSubscribeAck(client: Socket) {
//     try {
//       client.emit('ack-subscribed', {
//         status: 'subscribed',
//         timestamp: new Date(),
//       });
//       this.logger.log(`Client ${client.id} subscribed to ACK events`);
//     } catch (error) {
//       this.logger.error(`ACK subscription error: ${error.message}`);
//       client.emit('subscription-error', {
//         error: error.message,
//         timestamp: new Date(),
//       });
//     }
//   }

//   // Subscribe to firmware upgrade messages
//   @SubscribeMessage('subscribe-upgrade')
//   async handleSubscribeUpgrade(client: Socket) {
//     try {
//       client.emit('upgrade-subscribed', {
//         status: 'subscribed',
//         timestamp: new Date(),
//       });
//       this.logger.log(
//         `Client ${client.id} subscribed to firmware upgrade events`,
//       );
//     } catch (error) {
//       this.logger.error(`Upgrade subscription error: ${error.message}`);
//       client.emit('subscription-error', {
//         error: error.message,
//         timestamp: new Date(),
//       });
//     }
//   }

//   // Subscribe to heartbeat messages
//   @SubscribeMessage('subscribe-heartbeat')
//   async handleSubscribeHeartbeat(client: Socket) {
//     try {
//       client.emit('heartbeat-subscribed', {
//         status: 'subscribed',
//         timestamp: new Date(),
//       });
//       this.logger.log(`Client ${client.id} subscribed to heartbeat events`);
//     } catch (error) {
//       this.logger.error(`Heartbeat subscription error: ${error.message}`);
//       client.emit('subscription-error', {
//         error: error.message,
//         timestamp: new Date(),
//       });
//     }
//   }

//   // Subscribe to device reboot messages
//   @SubscribeMessage('subscribe-reboot')
//   async handleSubscribeReboot(client: Socket) {
//     try {
//       client.emit('reboot-subscribed', {
//         status: 'subscribed',
//         timestamp: new Date(),
//       });
//       this.logger.log(`Client ${client.id} subscribed to reboot events`);
//     } catch (error) {
//       this.logger.error(`Reboot subscription error: ${error.message}`);
//       client.emit('subscription-error', {
//         error: error.message,
//         timestamp: new Date(),
//       });
//     }
//   }

//   // Subscribe to telemetry messages
//   @SubscribeMessage('subscribe-telemetry')
//   async handleSubscribeTelemetry(client: Socket) {
//     try {
//       client.emit('telemetry-subscribed', {
//         status: 'subscribed',
//         timestamp: new Date(),
//       });
//       this.logger.log(`Client ${client.id} subscribed to telemetry events`);
//     } catch (error) {
//       this.logger.error(`Telemetry subscription error: ${error.message}`);
//       client.emit('subscription-error', {
//         error: error.message,
//         timestamp: new Date(),
//       });
//     }
//   }

//   // Subscribe to hardware status messages
//   @SubscribeMessage('subscribe-hardware-status')
//   async handleSubscribeHardwareStatus(client: Socket) {
//     try {
//       client.emit('hardware-status-subscribed', {
//         status: 'subscribed',
//         timestamp: new Date(),
//       });
//       this.logger.log(
//         `Client ${client.id} subscribed to hardware status events`,
//       );
//     } catch (error) {
//       this.logger.error(`Hardware status subscription error: ${error.message}`);
//       client.emit('subscription-error', {
//         error: error.message,
//         timestamp: new Date(),
//       });
//     }
//   }

//   // Client sends command to devices
//   @SubscribeMessage('send-command')
//   async handleSendCommand(
//     client: Socket,
//     payload: {
//       deviceId: string;
//       command: string;
//       parameters?: any;
//     },
//   ) {
//     try {
//       const { deviceId, command, parameters } = payload;

//       // Validate input
//       if (!deviceId || !command) {
//         throw new Error('Device ID and command are required');
//       }

//       // Publish command to MQTT
//       await this.mqttGatewayService.publishCommand(
//         deviceId,
//         command,
//         parameters,
//       );

//       // Broadcast command to all clients (for real-time dashboard updates)
//       this.server.emit('command-sent', {
//         deviceId,
//         command,
//         parameters,
//         sentBy: client.id,
//         timestamp: new Date(),
//       });

//       this.logger.log(`Command sent to device ${deviceId}: ${command}`);
//     } catch (error) {
//       this.logger.error(`Command error: ${error.message}`);
//       client.emit('command-error', {
//         error: error.message,
//         timestamp: new Date(),
//       });
//     }
//   }

//   // Client requests MQTT status
//   @SubscribeMessage('get-status')
//   async handleGetStatus(client: Socket) {
//     try {
//       const status = await this.mqttGatewayService.getMqttStatus();
//       client.emit('mqtt-status', status);
//     } catch (error) {
//       client.emit('status-error', {
//         error: error.message,
//         timestamp: new Date(),
//       });
//     }
//   }

//   // Broadcast device discovery to all clients
//   private broadcastDeviceDiscovery(payload: DiscoveryResponseDto) {
//     try {
//       this.server.emit('ws/discovery', {
//         event: 'ws/discovery',
//         data: payload,
//         timestamp: new Date(),
//         clientCount: this.connectedClients.size,
//       });
//       this.logger.log(
//         `Device discovery broadcasted for device ${payload.deviceId}`,
//       );
//     } catch (error) {
//       this.logger.error(`Broadcast device discovery error: ${error.message}`);
//     }
//   }

//   // Broadcast device assignment to all clients
//   private broadcastDeviceAssignment(payload: SensorFunctionalityResponseDto) {
//     try {
//       this.server.emit('device-assignment', {
//         event: 'device-assigned',
//         data: payload,
//         timestamp: new Date(),
//         clientCount: this.connectedClients.size,
//       });
//       this.logger.log(
//         `Device assignment broadcasted for device ${payload.deviceId}`,
//       );
//     } catch (error) {
//       this.logger.error(`Broadcast device assignment error: ${error.message}`);
//     }
//   }

//   // Broadcast acknowledgment to all clients
//   private broadcastAcknowledgment(payload: AckResponseDto) {
//     try {
//       this.server.emit('device-ack', {
//         event: 'acknowledgment-received',
//         data: payload,
//         timestamp: new Date(),
//         clientCount: this.connectedClients.size,
//       });
//       this.logger.log(
//         `Acknowledgment broadcasted for request ${payload.requestId}`,
//       );
//     } catch (error) {
//       this.logger.error(`Broadcast acknowledgment error: ${error.message}`);
//     }
//   }

//   // Broadcast firmware upgrade to all clients
//   private broadcastFirmwareUpgrade(payload: FwUpgradeResponseDto) {
//     try {
//       this.server.emit('firmware-upgrade', {
//         event: 'firmware-upgrade-status',
//         data: payload,
//         timestamp: new Date(),
//         clientCount: this.connectedClients.size,
//       });
//       this.logger.log(
//         `Firmware upgrade broadcasted for device ${payload.deviceId}`,
//       );
//     } catch (error) {
//       this.logger.error(`Broadcast firmware upgrade error: ${error.message}`);
//     }
//   }

//   // Broadcast heartbeat to all clients
//   private broadcastHeartbeat(payload: HeartbeatDto) {
//     try {
//       this.server.emit('device-heartbeat', {
//         event: 'heartbeat-received',
//         data: payload,
//         timestamp: new Date(),
//         clientCount: this.connectedClients.size,
//       });
//       this.logger.log(`Heartbeat broadcasted for device ${payload.deviceId}`);
//     } catch (error) {
//       this.logger.error(`Broadcast heartbeat error: ${error.message}`);
//     }
//   }

//   // Broadcast device reboot to all clients
//   private broadcastReboot(payload: DeviceRebootResponseDto) {
//     try {
//       this.server.emit('device-reboot', {
//         event: 'device-rebooted',
//         data: payload,
//         timestamp: new Date(),
//         clientCount: this.connectedClients.size,
//       });
//       this.logger.log(`Reboot broadcasted for device ${payload.deviceId}`);
//     } catch (error) {
//       this.logger.error(`Broadcast reboot error: ${error.message}`);
//     }
//   }

//   // Broadcast telemetry to all clients
//   private broadcastTelemetry(payload: TelemetryResponseDto) {
//     try {
//       this.server.emit('device-telemetry', {
//         event: 'telemetry-data-received',
//         data: payload,
//         timestamp: new Date(),
//         clientCount: this.connectedClients.size,
//       });
//       this.logger.log(`Telemetry broadcasted for device ${payload.deviceId}`);
//     } catch (error) {
//       this.logger.error(`Broadcast telemetry error: ${error.message}`);
//     }
//   }

//   // Broadcast hardware status to all clients
//   private broadcastHardwareStatus(payload: HardwareStatusResponseDto) {
//     try {
//       this.server.emit('device-hardware-status', {
//         event: 'hardware-status-received',
//         data: payload,
//         timestamp: new Date(),
//         clientCount: this.connectedClients.size,
//       });
//       this.logger.log(
//         `Hardware status broadcasted for device ${payload.deviceId}`,
//       );
//     } catch (error) {
//       this.logger.error(`Broadcast hardware status error: ${error.message}`);
//     }
//   }

//   // Broadcast sensor data to all connected clients
//   public broadcastSensorData(sensorData: any) {
//     try {
//       this.server.emit('sensor-data', {
//         ...sensorData,
//         timestamp: new Date(),
//         clientCount: this.connectedClients.size, // Useful for monitoring
//       });
//     } catch (error) {
//       this.logger.error(`Broadcast error: ${error.message}`);
//     }
//   }

//   // Broadcast MQTT connection status to all clients
//   public broadcastMqttStatus(status: any) {
//     this.server.emit('mqtt-status', {
//       ...status,
//       timestamp: new Date(),
//     });
//   }

//   // Broadcast system alerts to all clients
//   public broadcastAlert(alert: {
//     type: 'warning' | 'error' | 'info';
//     message: string;
//     sensorId?: string;
//     severity: 'low' | 'medium' | 'high';
//   }) {
//     this.server.emit('system-alert', {
//       ...alert,
//       timestamp: new Date(),
//     });
//   }

//   // Get connected clients count (for monitoring)
//   public getConnectedClientsCount(): number {
//     return this.connectedClients.size;
//   }

//   // Get client IDs (useful for debugging)
//   public getConnectedClientIds(): string[] {
//     return Array.from(this.connectedClients.keys());
//   }
// }
