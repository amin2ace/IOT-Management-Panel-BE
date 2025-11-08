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
import { LogContext } from '../../log-handler/enum/log-context.enum';
import { LogAction } from '../../log-handler/enum/log-action.enum';
import { LogHandlerService } from 'src/log-handler/log-handler.service';

@Injectable()
export class ExceptionHandlerInterceptor implements NestInterceptor {
  constructor(private readonly logger: LogHandlerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const ctxType = context.getType<'http' | 'rpc' | 'ws'>();

    return next.handle().pipe(
      tap(() => {
        // optional: you can measure performance here
        const elapsed = Date.now() - start;
        if (ctxType === 'http') {
          const request = context.switchToHttp().getRequest();
          this.logger.info(
            LogContext.DEVICE,
            request.url,
            LogAction.RESPONSE,
            `Completed in ${elapsed}ms`,
          );
        }
      }),
      catchError((error) => {
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        if (error instanceof HttpException) {
          status = error.getStatus();
          const response = error.getResponse();
          message =
            typeof response === 'string'
              ? response
              : ((response as any)?.message ?? message);
        }

        const request = context.switchToHttp().getRequest?.();
        const route = request?.url ?? ctxType.toUpperCase();

        this.logger.fail(
          LogContext.MQTT, // or LogContext.DEVICE / depending on your app module
          route,
          LogAction.RESPONSE,
          new Error(`[${status}] ${message}`),
          { ctxType, status },
        );

        return throwError(() => error);
      }),
    );
  }
}
