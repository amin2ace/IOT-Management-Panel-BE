import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttClientModule } from './mqtt-client/mqtt-client.module';
import { GatewayModule } from './gateway/gateway.module';
import jwtModuleOptions from './config/jwt-module.config';
import typeOrmModuleConfig from './config/typeorm-module-config';
import configModuleOptions from './config/config-module';
import { DeviceModule } from './device/device.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TopicModule } from './topic/topic.module';
import { RedisModule } from './redis/redis.module';
import { LogHandlerModule } from './log-handler/log-handler.module';
import { ResponserModule } from './responser/responser.module';
import { EncryptModule } from './encrypt/encrypt.module';
import { SessionModule } from './session/session.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filter/global-exception-filter';

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
    GatewayModule,
    DeviceModule,
    TopicModule,
    RedisModule,
    LogHandlerModule,
    ResponserModule,
    EncryptModule,
    SessionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    GatewayModule,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
