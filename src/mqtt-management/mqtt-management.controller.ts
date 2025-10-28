import { Controller } from '@nestjs/common';
import { MqttManagementService } from './mqtt-management.service';

@Controller('mqtt-management')
export class MqttManagementController {
  constructor(private readonly mqttManagementService: MqttManagementService) {}
}
