import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttManagementModule } from './mqtt-management/mqtt-management.module';
import { MqttGatewayModule } from './mqtt-gateway/mqtt.module';
import jwtModuleOptions from './config/jwt-module.config';
import typeOrmModuleConfig from './config/typeorm-module-config';
import configModuleOptions from './config/config-module.config';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './users/guard/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    JwtModule.registerAsync(jwtModuleOptions),
    TypeOrmModule.forRootAsync(typeOrmModuleConfig),
    AuthModule,
    UsersModule,
    MqttManagementModule,
    MqttGatewayModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MqttGatewayModule,
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Apply RolesGuard globally
    },
  ],
})
export class AppModule {}
