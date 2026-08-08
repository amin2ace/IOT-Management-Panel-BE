import { OptionalNumberApiProperty } from '@/common/decorator/api-properties/optional-number-property.decorator';
import { OptionalStringApiProperty } from '@/common/decorator/api-properties/optional-string-property.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class OtaConfigDto {
  @ApiProperty({
    description: 'Enable OTA updates',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @OptionalStringApiProperty({
    description: 'OTA firmware URL',
    required: false,
  })
  url?: string;

  @OptionalNumberApiProperty({
    description: 'Ota Check intervals',
    required: false,
  })
  checkInterval?: number;
}
