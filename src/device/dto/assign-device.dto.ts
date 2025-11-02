import { IsString, IsNotEmpty } from 'class-validator';

export class AssignDeviceDto {
  @IsString()
  @IsNotEmpty()
  assignedType: string;
}
