import { Controller } from '@nestjs/common';
import { LogHandlerService } from './log-handler.service';

@Controller('log-handler')
export class LogHandlerController {
  constructor(private readonly logHandlerService: LogHandlerService) {}
}
