import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Logger } from '@nestjs/common';

@Injectable()
export class ExceptionHandlerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ExceptionHandlerInterceptor.name, {
    timestamp: true,
  });

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    // Optional: extract correlation id from headers for tracing
    const request = context.switchToHttp().getRequest?.();
    const correlationId =
      request?.headers?.['x-correlation-id'] ||
      request?.headers?.['x-request-id'];

    // For non-HTTP contexts (WS / RPC), request may be undefined — still handle gracefully
    const contextType = context.getType<string>();

    return next.handle().pipe(
      tap(() => {
        // on success you can log timing or metrics
        const elapsed = Date.now() - now;
        if (contextType === 'http' && request) {
          const method = request.method;
          const url = request.url;
          this.logger.log(
            `[${correlationId ?? '-'}] ${method} ${url} — ${elapsed}ms`,
          );
        }
      }),
      catchError((err) => {
        // Normalize error: if not HttpException, wrap it to avoid leaking internals
        let normalizedError = err;

        if (!(err instanceof HttpException)) {
          // You can choose to log stack and return generic message
          this.logger.error(
            `[${correlationId ?? '-'}] Unhandled error: ${err?.message}`,
            err?.stack,
          );

          // Optionally integrate Sentry/other: Sentry.captureException(err)
          normalizedError = new HttpException(
            { message: 'Internal server error' },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        } else {
          // For HttpException, you may still log details
          const status = err.getStatus();
          const response = err.getResponse();
          this.logger.warn(
            `[${correlationId ?? '-'}] HttpException ${status} - ${JSON.stringify(
              response,
            )}`,
          );
        }

        // Re-throw the (possibly wrapped) exception so Nest handles http response formatting.
        return throwError(() => normalizedError);
      }),
    );
  }
}
