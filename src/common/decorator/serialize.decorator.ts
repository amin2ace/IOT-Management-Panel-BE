import { UseInterceptors } from '@nestjs/common';
import { SerializeInterceptor } from '../interceptors/serialize.interceptor';

/**
 * Serialize decorator to automatically transform responses
 * @param dto - The DTO class to use for serialization
 *
 * @example
 * @Serialize(UserResponseDto)
 * @Get(':id')
 * findOne(@Param('id') id: string) {
 *   return this.service.findOne(id);
 * }
 */
export function Serialize(dto: any) {
  return UseInterceptors(new SerializeInterceptor(dto));
}
