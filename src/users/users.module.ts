import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HashModule } from '@/hash/hash.module';
import { SessionModule } from '@/session/session.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HashModule, SessionModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export for AuthModule to use
})
export class UsersModule {}
