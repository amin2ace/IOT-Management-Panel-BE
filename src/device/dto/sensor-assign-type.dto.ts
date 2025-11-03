import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsArray } from 'class-validator';
import { DeviceCapabilities } from 'src/config/enum/device-capabilities.enum';

export class SensorAssignTypeDto {
  @ApiProperty({
    description: 'The provisioning state of the device',
    enum: DeviceCapabilities, // the enum itself
    enumName: 'DeviceCapabilities', // optional but helps Swagger
    isArray: true,

    example: [DeviceCapabilities.TEMPERATURE], // optional example
  })
  @IsEnum(DeviceCapabilities, { each: true })
  @IsArray()
  @IsNotEmpty()
  assignedType: DeviceCapabilities[];
}
