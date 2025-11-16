import { SignupInputDto as HashDto } from '../../auth/dto/signup-input.dto';

export interface IHashService {
  salt: string;

  hash(dataToHash: Partial<HashDto>): Promise<Partial<HashDto>>;

  hashEmail(email: string): Promise<{ hashedEmail: string }>;

  compareHash(hashedData: string, plainText: string): Promise<boolean>;
}
