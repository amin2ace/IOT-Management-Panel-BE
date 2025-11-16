import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TrackUserCache {
  @Expose()
  @ApiProperty({
    description: 'Unique user identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @Expose()
  @ApiProperty({
    description: 'Unique session identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  sessionId: string;
}
