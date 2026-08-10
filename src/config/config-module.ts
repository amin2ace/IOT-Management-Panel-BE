import { ConfigModuleOptions } from '@nestjs/config';
import configValidationSchema from './joi-validation-schema.config';
import { isProductionEnvironment } from '@/common/utils/environment.util';

const envFilePath = isProductionEnvironment()
  ? ['.env.production', '.env']
  : ['.env.development', '.env'];

const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  validationSchema: configValidationSchema,
  envFilePath,
};

export default configModuleOptions;
