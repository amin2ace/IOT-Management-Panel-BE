import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';
import { IsValidEpochMillis } from 'src/config/decorator/uptime-validation.decorator';

export class SensorMetricDto {
  @ApiProperty({
    description: 'Unique identifier for the response',
    example: 'res-12346',
  })
  @IsString()
  @IsNotEmpty()
  responseId: string;

  @ApiProperty({
    description: 'Numeric code representing the response type',
    example: 201,
  })
  @IsNumber()
  @IsNotEmpty()
  responseCode: number; // Request Message Code

  @ApiProperty({
    description: 'Unique identifier of the sensor',
    example: 'sensor-67890',
  })
  @IsString()
  deviceId: string; // Request from specific device

  @ApiProperty({
    description: 'Memory usage in KB',
    example: '232500',
  })
  @IsNumber()
  @IsNotEmpty()
  memoryUsage: number;

  @ApiProperty({
    description: 'CPU usage in percent',
    example: '32',
  })
  @IsNumber()
  @IsNotEmpty()
  cpuUsage: number;

  @IsValidEpochMillis({ message: 'Uptime must be valid epoch milliseconds' })
  uptime: number;

  @ApiProperty({
    description: 'Time of the request in epoch milli second',
    example: '1762379573804',
  })
  @IsValidTimestampMillis() // 5min behind, 30sec ahead
  timestamp: number;

  @ApiProperty({
    description: 'Hardware internal temperature in celcius degree',
    example: '78',
  })
  @IsNumber()
  @IsNotEmpty()
  internalTemp: number;

  @ApiProperty({
    description: 'Wifi Received Signal Strength Indicator',
    example: '-52',
  })
  @IsString()
  @IsNotEmpty()
  wifiRssi: number;
}

/**
  Example:
  {
  "heap": 143872,
  "cpuUsage": 31,
  "uptimeSec": 45000,
  "temperatureInternal": 36.5,
  "wifiRssi": -64,
  "timestamp": "2025-11-04T11:12:10Z"
}
 */
