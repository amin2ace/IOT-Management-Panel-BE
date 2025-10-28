import * as joi from 'joi';

const configValidationSchema: joi.ObjectSchema = joi.object({
  // Server Configs
  PORT: joi.number().required().default(3000),

  // Jwt Configs
  JWT_EXPIRES_IN: joi.string().required().default('1h'),
  JWT_SECRET: joi.string().required().default('123@qwe'),

  // DB: Sql Configs
  DB_TYPE: joi.string().required(),
  DB_NAME: joi.string().required(),

  // DB: Mongodb Config
  DB_URI: joi.string().required(),

  // DB: Sqlite Config
  SQLITE_DB_NAME: joi.string().required().default('database.db'),

  // Hash Configs
  ROUNDS: joi.number().required().default(10),
});

export default configValidationSchema;
