import { OptionalStringApiProperty } from '@/common/decorator/api-properties/optional-string-property.decorator';
export class HashDto {
  @OptionalStringApiProperty({ default: 'John Wick' })
  userName?: string;

  @OptionalStringApiProperty({ default: 'john@wick.com' })
  email?: string;

  @OptionalStringApiProperty({ default: '123456789' })
  password?: string;
}
