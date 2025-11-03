import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ProvisionState } from 'src/config/enum/device-state.enum';

export class AssignDeviceDto {
  @ApiProperty()
  @IsEnum(ProvisionState)
  @IsNotEmpty()
  assignedType: ProvisionState;
}
