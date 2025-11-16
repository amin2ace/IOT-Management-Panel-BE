import { Module } from '@nestjs/common';
import { HashController } from './hash.controller';
import { HashService } from './hash.service';
import { SessionModule } from '@/session/session.module';

@Module({
  imports: [SessionModule],
  controllers: [HashController],
  providers: [HashService],
  exports: [HashService],
})
export class HashModule {}
