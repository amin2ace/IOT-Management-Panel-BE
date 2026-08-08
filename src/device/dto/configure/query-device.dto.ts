import { OptionalStringApiProperty } from '@/common/decorator/api-properties/optional-string-property.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
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
  provisionState?: ProvisionState;

  @ApiProperty({
    description: 'The provisioning state of the device',
    example: [DeviceCapabilities.TEMPERATURE], // optional example
  })
  @IsOptional()
  @IsArray()
  functionality?: DeviceCapabilities[]; // e.g. ["temperature", "humidity"]

  @OptionalStringApiProperty({
    description: 'Unique identifier of the device',
    example: 'sensor-67890',
  })
  deviceId?: string; // Request from specific device
}
