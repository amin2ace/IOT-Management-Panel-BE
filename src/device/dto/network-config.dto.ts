import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ description: 'WiFi SSID' })
  @IsString()
  @IsNotEmpty()
  wifiSsid: string;

  @ApiProperty({ description: 'WiFi Password' })
  @IsString()
  @IsNotEmpty()
  wifiPassword: string;

  @ApiProperty({
    description: 'DHCP server address',
    required: false,
    example: '192.168.1.1',
  })
  @IsBoolean()
  @IsNotEmpty()
  dhcp: boolean;

  @ApiProperty({
    description: 'Device IP address if dhcp disabled',
    required: false,
    example: '192.168.1.100',
  })
  @IsIP('4')
  @IsOptional()
  ip?: string;

  @ApiProperty({
    description: 'Subnet Mask',
    required: false,
    example: '255.255.255.0',
  })
  @IsOptional()
  @IsSubnetMask({ message: 'Invalid subnet mask' })
  subnetMask?: string;

  @ApiProperty({
    description: 'gateway address',
    required: false,
    example: '192.168.1.1',
  })
  @IsIP('4')
  @IsOptional()
  gateway?: string;

  @ApiProperty({
    description: 'Primary dns server address',
    required: false,
    example: '192.168.1.1',
  })
  @IsIP('4')
  @IsOptional()
  dnsServer1?: string;

  @ApiProperty({
    description: 'Secondary dns server address',
    required: false,
    example: '8.8.8.8',
  })
  @IsIP('4')
  @IsOptional()
  dnsServer2?: string;
}
