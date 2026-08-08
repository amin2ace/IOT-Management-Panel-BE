import { RequiredStringApiProperty } from '@/common/decorator/api-properties/required-string-property.decorator';

export class TokenInputDto {
  @RequiredStringApiProperty()
  accessToken: string;

  @RequiredStringApiProperty()
  refreshToken: string;
}
