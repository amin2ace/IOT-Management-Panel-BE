import { Injectable } from '@nestjs/common';
import { CreateMqttGatewayDto } from './dto/create-mqtt-gateway.dto';
import { UpdateMqttGatewayDto } from './dto/update-mqtt-gateway.dto';

@Injectable()
export class MqttGatewayService {
  create(createMqttGatewayDto: CreateMqttGatewayDto) {
    return 'This action adds a new mqttGateway';
  }

  findAll() {
    return `This action returns all mqttGateway`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mqttGateway`;
  }

  update(id: number, updateMqttGatewayDto: UpdateMqttGatewayDto) {
    return `This action updates a #${id} mqttGateway`;
  }

  remove(id: number) {
    return `This action removes a #${id} mqttGateway`;
  }
}
