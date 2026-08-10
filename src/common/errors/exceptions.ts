import { BaseExceptionDefinition } from './exceptions.types';

export const EXCEPTIONS = {
  INVALID_REQUEST: {
    code: 'INVALID_REQUEST',
    message: 'Invalid request',
    logMessage: 'Invalid request received from client',
  },

  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid credentials',
    logMessage: 'Authentication failed due to invalid credentials',
  },

  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User not found',
    logMessage: 'User lookup failed because the user does not exist',
  },

  EMAIL_ALREADY_EXISTS: {
    code: 'EMAIL_ALREADY_EXISTS',
    message: 'Email already exists',
    logMessage: 'Registration attempted with an existing email',
  },

  ACCESS_DENIED: {
    code: 'ACCESS_DENIED',
    message: 'Access denied',
    logMessage: 'User attempted to access a forbidden resource',
  },
  ENCRYPTION_FAILED: {
    code: 'ENCRYPTION_FAILED',
    message: 'Encryption failed',
    logMessage: 'The encryption method failed',
  },
  SESSION_ESTABLISH_FAILED: {
    code: 'SESSION_ESTABLISH_FAILED',
    message: 'Session establishment failed',
    logMessage: 'Failed to establish a new session',
  },
  SESSION_VALIDATION_FAILED: {
    code: 'SESSION_VALIDATION_FAILED',
    message: 'Session validation failed',
    logMessage: 'Failed to validate the session',
  },
  SESSION_DESTROY_FAILED: {
    code: 'SESSION_DESTROY_FAILED',
    message: 'Session destruction failed',
    logMessage: 'Failed to destroy the session',
  },
  SESSION_EXTENSION_FAILED: {
    code: 'SESSION_EXTENSION_FAILED',
    message: 'Session extension failed',
    logMessage: 'Failed to extend the session',
  },
  SESSION_INVALIDATION_FAILED: {
    code: 'SESSION_INVALIDATION_FAILED',
    message: 'Session invalidation failed',
    logMessage: 'Failed to invalidate user sessions',
  },
  SESSION_RETRIEVE_FAILED: {
    code: 'SESSION_RETRIEVE_FAILED',
    message: 'Session retrieval failed',
    logMessage: 'Failed to retrieve session data',
  },
} as const satisfies Record<string, BaseExceptionDefinition>;
