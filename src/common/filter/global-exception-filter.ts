import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { QueryFailedError } from 'typeorm';
import { AppException } from '../errors/app.exception';
import { isProductionEnvironment } from '../utils/environment.util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let logMessage = 'Unhandled exception';

    if (exception instanceof AppException) {
      status = exception.getStatus();
      code = exception.definition.code;
      message = exception.definition.message;
      logMessage = exception.definition.logMessage;
    } else if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      code = 'VALIDATION_ERROR';
      message =
        this.extractValidationMessage(exception.getResponse()) ??
        'Validation failed';
      logMessage = 'Validation failed';
    } else if (
      exception instanceof QueryFailedError ||
      exception instanceof MongoServerError
    ) {
      const dbError =
        exception instanceof QueryFailedError
          ? (exception as any).driverError
          : exception;

      if (dbError?.code === 11000) {
        status = HttpStatus.CONFLICT;
        code = 'DATABASE_DUPLICATE_KEY';
        message =
          this.extractMongoErrorMessage(dbError) ?? 'Duplicate key error';
        logMessage = 'Database duplicate key error';
      } else {
        status = HttpStatus.BAD_REQUEST;
        code = 'DATABASE_ERROR';
        message =
          this.extractMongoErrorMessage(dbError) ?? 'Database operation failed';
        logMessage = 'Database error';
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      message = this.extractHttpExceptionMessage(responseBody) ?? message;
      logMessage = `HTTP ${status} exception`;
    } else if (exception instanceof Error) {
      message = exception.message || message;
      logMessage = exception.name;
    }

    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error({
      code,
      message: logMessage,
      statusCode: status,
      method: request.method,
      path: request.url,
      stack,
    });

    const payload: Record<string, unknown> = {
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (!isProductionEnvironment() && stack) {
      payload.stack = stack;
    }

    response.status(status).json(payload);
  }

  private extractValidationMessage(responseBody: unknown): string | undefined {
    if (!responseBody || typeof responseBody !== 'object') {
      return undefined;
    }

    const body = responseBody as Record<string, unknown>;
    const message = body.message;

    if (Array.isArray(message)) {
      return message
        .flatMap((item) => this.formatValidationItem(item))
        .join('; ');
    }

    if (typeof message === 'string') {
      return message;
    }

    return undefined;
  }

  private formatValidationItem(item: unknown): string[] {
    if (typeof item === 'string') {
      return [item];
    }

    if (Array.isArray(item)) {
      return item.flatMap((nestedItem) =>
        this.formatValidationItem(nestedItem),
      );
    }

    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      return Object.values(obj).flatMap((value) =>
        this.formatValidationItem(value),
      );
    }

    return [];
  }

  private extractHttpExceptionMessage(
    responseBody: unknown,
  ): string | undefined {
    if (!responseBody) {
      return undefined;
    }

    if (typeof responseBody === 'string') {
      return responseBody;
    }

    if (typeof responseBody === 'object') {
      const body = responseBody as Record<string, unknown>;
      const message = body.message ?? body.error;

      if (Array.isArray(message)) {
        return message
          .flatMap((item) => this.formatValidationItem(item))
          .join('; ');
      }

      if (typeof message === 'string') {
        return message;
      }
    }

    return undefined;
  }

  private extractMongoErrorMessage(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') {
      return undefined;
    }

    const mongoError = error as Record<string, unknown>;
    if (typeof mongoError.message === 'string') {
      return mongoError.message;
    }

    return undefined;
  }
}
