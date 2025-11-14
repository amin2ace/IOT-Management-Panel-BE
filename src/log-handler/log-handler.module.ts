import { Module } from '@nestjs/common';
import { LogHandlerService } from './log-handler.service';
import { LogHandlerController } from './log-handler.controller';

@Module({
  controllers: [LogHandlerController],
  providers: [LogHandlerService],
  exports: [LogHandlerService],
})
export class LogHandlerModule {}
