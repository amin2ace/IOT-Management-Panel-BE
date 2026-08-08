import { RequiredStringApiProperty } from '@/common/decorator/api-properties/required-string-property.decorator';

export class ChangePasswordDto {
  @RequiredStringApiProperty({ default: '123456789' })
  oldPassword: string;

  @RequiredStringApiProperty({ default: 'a123456789s' })
  newPassword: string;

  @RequiredStringApiProperty({ default: 'a123456789s' })
  retypePassword: string;
}
