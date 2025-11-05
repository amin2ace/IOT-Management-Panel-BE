import {
  IsBoolean,
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsSubnetMask } from 'src/config/decorator/subnetmask-validation.decrator';

// Nested DTOs
export class NetworkConfigDto {
  @IsString()
  @IsNotEmpty()
  wifiSsid: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsBoolean()
  @IsNotEmpty()
  dhcp: boolean;

  @IsIP('4')
  @IsOptional()
  ip?: string;

  @IsSubnetMask({ message: 'Invalid subnet mask' })
  subnetMask?: string;

  @IsIP('4')
  @IsOptional()
  gateway?: string;

  @IsIP('4')
  @IsOptional()
  dnsServer1?: string;

  @IsIP('4')
  @IsOptional()
  dnsServer2?: string;
}
