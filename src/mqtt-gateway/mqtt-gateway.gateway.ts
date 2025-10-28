import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { MqttGatewayService } from './mqtt-gateway.service';
import { CreateMqttGatewayDto } from './dto/create-mqtt-gateway.dto';
import { UpdateMqttGatewayDto } from './dto/update-mqtt-gateway.dto';

@WebSocketGateway()
export class MqttGatewayGateway {
  constructor(private readonly mqttGatewayService: MqttGatewayService) {}

  @SubscribeMessage('createMqttGateway')
  create(@MessageBody() createMqttGatewayDto: CreateMqttGatewayDto) {
    return this.mqttGatewayService.create(createMqttGatewayDto);
  }

  @SubscribeMessage('findAllMqttGateway')
  findAll() {
    return this.mqttGatewayService.findAll();
  }

  @SubscribeMessage('findOneMqttGateway')
  findOne(@MessageBody() id: number) {
    return this.mqttGatewayService.findOne(id);
  }

  @SubscribeMessage('updateMqttGateway')
  update(@MessageBody() updateMqttGatewayDto: UpdateMqttGatewayDto) {
    return this.mqttGatewayService.update(updateMqttGatewayDto.id, updateMqttGatewayDto);
  }

  @SubscribeMessage('removeMqttGateway')
  remove(@MessageBody() id: number) {
    return this.mqttGatewayService.remove(id);
  }
}
