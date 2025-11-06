import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';
import { SensorType } from 'src/config/enum/sensor-type.enum';

export class SensorFunctionalityRequestDto {
  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'req-12345',
  })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({
    description: 'Numeric code representing the request type',
    example: 101,
  })
  @IsNumber()
  @IsNotEmpty()
  requestCode: number; // Request Message Code

  @ApiProperty({
    description: 'Unique identifier of the device',
    example: 'sensor-67890',
  })
  @IsString()
  deviceId: string; // Request from specific device

  @ApiProperty({
    description: 'Time of the request in epoch milli second',
    example: '1762379573804',
  })
  @IsValidTimestampMillis() // 5min behind, 30sec ahead
  timestamp: number;

  @ApiProperty({
    description: 'The provisioning state of the device',
    enum: SensorType, // the enum itself
    enumName: 'DeviceCapabilities', // optional but helps Swagger
    isArray: true,
    example: [SensorType.TEMPERATURE], // optional example
  })
  @IsEnum(SensorType, { each: true })
  @IsArray()
  @IsNotEmpty()
  functionality: SensorType[]; // e.g. ["temperature", "humidity"]

  @ApiProperty({
    description: 'MQTT topic to publish sensor data to',
    example: 'sensors/sensorId/assign',
  })
  @IsString()
  @IsNotEmpty()
  publishTopic: string; // like "sensors/<client>/temperature/<device>"

  @ApiProperty({
    description: 'Data publishing interval in milliseconds',
    example: 5000,
  })
  @IsNumber()
  @IsNotEmpty()
  interval: number; // e.g. 5000 for 5 seconds

  @ApiProperty({
    description: 'High set point for the sensor',
    example: '{ "high": 25.0}',
  })
  @IsNotEmpty()
  highSetPoint: string; // e.g. { "high": 25.0}

  @ApiProperty({
    description: 'Low set point for the sensor',
    example: '{ "low": 0.2}',
  })
  @IsNotEmpty()
  lowSetPoint: string; // e.g. { "low": 0.2}

  @ApiProperty({
    description: 'Whether acknowledgment is required',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  ackRequired: boolean; // whether acknowledgment is required

  @ApiProperty({
    description: 'Digital signature for security',
    example: 'abc123signature',
  })
  @IsString()
  signature: string; // digital signature for security
}
