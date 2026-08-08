import { RequiredStringApiProperty } from '@/common/decorator/api-properties';
import { OptionalStringApiProperty } from '@/common/decorator/api-properties/optional-string-property.decorator';
export class MqttConfigDto {
  @OptionalStringApiProperty({
    description: 'MQTT broker URL',
    example: 'mqtt://192.168.1.10:1883',
  })
  broker?: string;

  @OptionalStringApiProperty({
    description: 'MQTT username',
    required: false,
  })
  username?: string;

  @OptionalStringApiProperty({
    description: 'MQTT password',
    required: false,
  })
  password?: string;

  @RequiredStringApiProperty({
    description: 'Base MQTT topic for broadcasting',
    example: 'greeenHouse_jolfa/broadcast',
  })
  broadcastTopic: string;
}
