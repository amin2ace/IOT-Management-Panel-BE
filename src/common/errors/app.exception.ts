import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionDefinition } from './exceptions.types';

export class AppException extends HttpException {
  constructor(
    public readonly definition: ExceptionDefinition,
    status: HttpStatus,
  ) {
    super(
      {
        code: definition.code,
        message: definition.message,
      },
      status,
    );
  }
}
