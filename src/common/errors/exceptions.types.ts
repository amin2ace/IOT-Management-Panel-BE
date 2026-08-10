import { EXCEPTIONS } from './exceptions';

export interface BaseExceptionDefinition {
  readonly code: string;
  readonly message: string;
  readonly logMessage: string;
}

export type ExceptionDefinition = (typeof EXCEPTIONS)[keyof typeof EXCEPTIONS];
