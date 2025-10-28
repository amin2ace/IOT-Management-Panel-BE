import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({ default: "123456789" })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ default: "a123456789s" })
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ default: "a123456789s" })
  @IsString()
  @IsNotEmpty()
  retypePassword: string;
}
