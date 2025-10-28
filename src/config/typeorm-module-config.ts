import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { join } from 'path';

const typeOrmModuleConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const url = configService.get<string>('DB_URI');
    if (!url) {
      throw new Error(
        'DB_URI is not set. Please set DB_URI in your environment for MongoDB connection.',
      );
    }
    const syncEnv = configService.get<string>('TYPEORM_SYNCHRONIZE');
    const synchronize =
      typeof syncEnv === 'string'
        ? syncEnv.toLowerCase() === 'true'
        : (configService.get<boolean>('TYPEORM_SYNCHRONIZE') ?? true);

    return {
      type: 'mongodb',
      url,
      // Use a path-based glob so TypeORM loads all entity files in both TS and JS environments.
      entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
      // Pass MongoDB driver options via `extra`
      // extra: {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
      // },
      // Make synchronize configurable via env; default preserved for local use.
      synchronize, // TODO: set false for production
      // Optional: enable logging for local debugging (set via env if needed)
      logging: configService.get<boolean>('TYPEORM_LOGGING') ?? false,
    };
  },
};
export default typeOrmModuleConfig;
