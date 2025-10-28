import { Module } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import jwtModuleOptions from './config/jwt-module.config';
import typeOrmModuleConfig from './config/typeorm-module-config';
import configModuleOptions from './config/config-module.config';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    JwtModule.registerAsync(jwtModuleOptions),
    TypeOrmModule.forRootAsync(typeOrmModuleConfig),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
