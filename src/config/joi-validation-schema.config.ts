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
  DB_URI: joi.string().when('DB_TYPE', {
    is: 'mongodb',
    then: joi.string().required(),
    otherwise: joi.string().optional(),
  }),
  SQLITE_DB_NAME: joi.string().when('DB_TYPE', {
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

  // MQTT
  MQTT_USERNAME: joi.string().required(),
  MQTT_PASSWORD: joi.string().required(),
  MQTT_BROKER_URL: joi.string().required(),
  BASE_TOPIC: joi.string().required(),

  // caching
  REDIS_HOST: joi.string().required(),
  REDIS_PORT: joi.number().required(),
  REDIS_PASSWORD: joi.string().required(),
  REDIS_DB: joi.number().required(),
  REDIS_TTL: joi.number().required(),

  // Session / Authentication
  AUTH_MODE: joi.string().valid('local', 'jwt').default('local'), // 'local' for offline (session), 'jwt' for online
  SESSION_TIMEOUT: joi.number().default(24 * 60 * 60 * 1000), // 24 hours in milliseconds
  SESSION_REFRESH_INTERVAL: joi.number().default(5 * 60 * 1000), // 5 minutes in milliseconds
  SESSION_SECRET: joi.string().min(16).default('session-secret-change-me'),
});

export default configValidationSchema;
