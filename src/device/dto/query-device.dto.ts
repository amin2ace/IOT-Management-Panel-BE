import { IsOptional, IsString } from 'class-validator';

export class QueryDeviceDto {
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() client?: string;
}
