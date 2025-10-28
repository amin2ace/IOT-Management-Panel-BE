import { IsNotEmpty, IsString } from "class-validator";

export class TokenInputDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
