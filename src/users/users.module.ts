import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EncryptModule } from '@/encrypt/encrypt.module';
import { SessionModule } from '@/session/session.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), EncryptModule, SessionModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export for AuthModule to use
})
export class UsersModule {}
