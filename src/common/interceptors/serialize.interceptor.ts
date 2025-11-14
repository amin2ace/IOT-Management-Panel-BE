import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

/**
 * Serialize Interceptor
 * Transforms response data using class-transformer to serialize it according to the DTO
 * - Excludes properties marked with @Exclude()
 * - Transforms nested objects according to DTO decorators
 */
@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        // Handle null/undefined
        if (!data) {
          return data;
        }

        // Handle arrays
        if (Array.isArray(data)) {
          return data.map((item) =>
            plainToClass(this.dto, item, {
              excludeExtraneousValues: false,
            }),
          );
        }

        // Handle single object
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: false,
        });
      }),
    );
  }
}
