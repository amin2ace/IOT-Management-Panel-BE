import { ConfigModuleOptions } from '@nestjs/config';
import configValidationSchema from './joi-validation-schema.config';

const envFilePath =
  process.env.NODE_ENV === 'production'
    ? ['.env.production', '.env']
    : ['.env.development', '.env'];

const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  validationSchema: configValidationSchema,
  envFilePath,
};

export default configModuleOptions;
