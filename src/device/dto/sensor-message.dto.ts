import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  IsObject,
  IsDate,
} from 'class-validator';
import { ConnectionState } from 'src/config/enum/connection-state.enum';
import { Protocol } from 'src/config/enum/protocol.enum';
import { SensorType } from 'src/config/enum/sensor-type.enum';
import { DeviceLocationDto } from './device-location.dto';
import { ApiProperty } from '@nestjs/swagger';

export class AdditionalInfoDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  model?: string;
}

export class SensorMessageDto {
  @ApiProperty()
  @IsString()
  sensorId: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  capabilities: SensorType[]; // e.g. ["temperature", "humidity"]

  @ApiProperty()
  @IsString()
  deviceHardware: string;

  @ApiProperty()
  @IsString()
  publishTopic?: string; // like "sensors/<client>/temperature/<device>"

  @ApiProperty()
  @IsEnum(ConnectionState)
  connectionState: ConnectionState;

  @ApiProperty()
  @IsString()
  firmware: string;

  @ApiProperty()
  @IsString()
  mac: string;

  @ApiProperty()
  @IsString()
  ip: string;

  @ApiProperty()
  @IsDate()
  connectedTime: Date;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  location?: DeviceLocationDto;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Protocol)
  protocol?: Protocol;

  @ApiProperty()
  @IsOptional()
  @IsString()
  broker?: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  additionalInfo?: AdditionalInfoDto;
}

export const MOCK_SENSOR_MESSAGE: SensorMessageDto = {
  publishTopic: 'sensors/client-123/temperature/sensor-001',
  sensorId: 'sensor-001',
  mac: 'A4:C1:38:2F:7B:9D',
  ip: '192.168.1.45',
  firmware: 'v1.2.3',
  deviceHardware: 'ESP32-DevKitC',
  capabilities: [SensorType.HUMIDITY, SensorType.TEMPERATURE],
  connectedTime: new Date(),
  connectionState: ConnectionState.ONLINE,
  location: {
    site: 'greenhouse-1',
    floor: 1,
    unit: 'tomato-section',
  },
  protocol: Protocol.MQTT,
  broker: 'mqtt://192.168.1.10:1883',
  additionalInfo: {
    manufacturer: 'Acme Sensors',
    model: 'T1000',
  },
};
