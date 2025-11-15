import { Controller } from '@nestjs/common';
import { ResponserService } from './responser.service';

@Controller('responser')
export class ResponserController {
  constructor(private readonly responserService: ResponserService) {}
}
