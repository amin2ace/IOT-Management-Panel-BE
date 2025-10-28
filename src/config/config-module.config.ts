import { ConfigModuleOptions } from '@nestjs/config';
import configValidationSchema from './joi-validation-schema.config';

const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  validationSchema: configValidationSchema,
};

export default configModuleOptions;
