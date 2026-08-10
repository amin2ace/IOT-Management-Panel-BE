import { Controller } from '@nestjs/common';
import { EncryptService } from './encrypt.service';

@Controller('hash')
export class EncryptController {
  constructor(private readonly encryptService: EncryptService) {}
}
