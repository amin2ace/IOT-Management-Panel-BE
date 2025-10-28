import * as joi from 'joi';

const configValidationSchema: joi.ObjectSchema = joi.object({
  // Server
  PORT: joi.number().default(3000),
  NODE_ENV: joi
    .string()
    .valid('development', 'production', 'test')
    .default('development'),
  API_PREFIX: joi.string().default('api'),
  FRONTEND_URL: joi.string().uri().default('http://localhost:3000'),

  // JWT
  JWT_SECRET: joi.string().min(16).required(),
  JWT_EXPIRES_IN: joi.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: joi.string().default('7d'),

  // Cookies
  COOKIE_SECRET: joi.string().min(16).default('cookie-secret-change-me'),

  // Database
  DB_TYPE: joi
    .string()
    .required()
    .valid('mongodb', 'mysql', 'postgres', 'sqlite'),
  DB_NAME: joi.string().required(),
  DB_URI: joi
    .string()
    .when('DB_TYPE', {
      is: 'mongodb',
      then: joi.string().required(),
      otherwise: joi.string().optional(),
    }),
  SQLITE_DB_NAME: joi
    .string()
    .when('DB_TYPE', {
      is: 'sqlite',
      then: joi.string().default('database.db'),
      otherwise: joi.string().optional(),
    }),

  // Hashing
  ROUNDS: joi.number().default(10),

  // Email (for password reset)
  SMTP_HOST: joi.string().required(),
  SMTP_PORT: joi.number().required(),
  SMTP_USER: joi.string().required(),
  SMTP_PASS: joi.string().required(),
  EMAIL_FROM: joi.string().email().required(),
});

export default configValidationSchema;
