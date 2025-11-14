import { Module } from '@nestjs/common';
import { LogHandlerService } from './log-handler.service';

@Module({
  providers: [LogHandlerService],
  exports: [LogHandlerService],
})
export class LogHandlerModule {}
