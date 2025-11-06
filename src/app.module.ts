import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttClientModule } from './mqtt-client/mqtt-client.module';
import { MqttGatewayModule } from './gateway/gateway.module';
import jwtModuleOptions from './config/jwt-module.config';
import typeOrmModuleConfig from './config/typeorm-module-config';
import configModuleOptions from './config/config-module.config';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './users/guard/roles.guard';
import { DeviceModule } from './device/device.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TopicModule } from './topic/topic.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    JwtModule.registerAsync(jwtModuleOptions),
    TypeOrmModule.forRootAsync(typeOrmModuleConfig),
    EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: false,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: false,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
    AuthModule,
    UsersModule,
    MqttClientModule,
    MqttGatewayModule,
    DeviceModule,
    TopicModule,
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
