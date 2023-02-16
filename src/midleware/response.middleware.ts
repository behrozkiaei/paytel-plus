import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          data.hasOwnProperty('status') &&
          data.hasOwnProperty('message')
        ) {
          return {
            ...data,
            status: data.status ? data.status : false,
          };
        }
        if (
          data &&
          (!data.hasOwnProperty('result') || !data.hasOwnProperty('status'))
        ) {
          return {
            result: data,
            statusCode: 0,
            message: data?.message,
            status: true,
          };
        }

        return data;
      }),
    );
  }
}
