import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    example: 409,
  })
  statusCode!: number;

  @ApiProperty({
    example: 'EMAIL_ALREADY_EXISTS',
  })
  code!: string;

  @ApiProperty({
    example: 'Email already exists',
  })
  message!: string;

  @ApiProperty({
    example: '2026-08-10T18:30:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    example: '/auth/signup',
  })
  path!: string;
}
