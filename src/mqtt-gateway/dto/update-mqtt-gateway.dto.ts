import { PartialType } from '@nestjs/mapped-types';
import { CreateMqttGatewayDto } from './create-mqtt-gateway.dto';

export class UpdateMqttGatewayDto extends PartialType(CreateMqttGatewayDto) {
  id: number;
}
