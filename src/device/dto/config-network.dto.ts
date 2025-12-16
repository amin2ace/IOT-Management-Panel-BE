import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { IsSubnetMask } from 'src/config/decorator/subnetmask-validation.decrator';

// Nested DTOs
export class NetworkConfigDto {
  @ApiProperty({
    description: 'Device MAC address',
    example: '5C:CF:7F:12:34:56',
    required: false,
  })
  @IsOptional()
  @IsString()
  macAddress?: string;

  @ApiProperty({ description: 'WiFi SSID' })
  @IsString()
  @IsOptional()
  wifiSsid?: string;

  @ApiProperty({ description: 'WiFi Password' })
  @IsString()
  @IsOptional()
  wifiPassword?: string;

  @ApiProperty({
    description: 'DHCP server address',
    required: false,
    example: '192.168.1.1',
  })
  @IsBoolean()
  @IsOptional()
  dhcp?: boolean;

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
  // @IsSubnetMask({ message: 'Invalid subnet mask' })
  @IsOptional()
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

  @ApiProperty()
  @IsOptional()
  @IsString()
  accessPointSsid?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  // @IsStrongPassword({
  //   minLength: 8,
  //   minLowercase: 0,
  //   minNumbers: 0,
  //   minSymbols: 0,
  //   minUppercase: 0,
  // })
  accessPointPassword?: string; // TODO: Access point password policy
}
