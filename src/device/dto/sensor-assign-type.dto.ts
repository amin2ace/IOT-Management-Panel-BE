import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsArray } from 'class-validator';
import { SensorType } from 'src/config/enum/sensor-type.enum';

export class SensorFunctionAssignDto {
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
  assignedType: SensorType[];
}
