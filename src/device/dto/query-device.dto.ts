import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProvisionState } from 'src/config/enum/provision-state.enum';
import { DeviceCapabilities } from 'src/config/enum/sensor-type.enum';

export class QueryDeviceDto {
  @ApiProperty({
    description: 'The state of provisioning for device',
    enum: ProvisionState,
    enumName: 'ProvisionState',
  })
  @IsOptional()
  @IsEnum(ProvisionState)
  provisionState?: string;

  @ApiProperty({
    description: 'The provisioning state of the device',
    enum: DeviceCapabilities, // the enum itself
    enumName: 'DeviceCapabilities', // optional but helps Swagger
    example: DeviceCapabilities.TEMPERATURE, // optional example
  })
  @IsOptional()
  @IsEnum(DeviceCapabilities)
  functionality?: DeviceCapabilities; // e.g. ["temperature", "humidity"]

  @ApiProperty({
    description: 'Unique identifier of the device',
    example: 'sensor-67890',
  })
  @IsOptional()
  @IsString()
  deviceId?: string; // Request from specific device
}
