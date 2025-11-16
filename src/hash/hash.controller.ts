import { Controller } from '@nestjs/common';
import { HashService } from './hash.service';

@Controller('hash')
export class HashController {
  constructor(private readonly hashService: HashService) {}
}
