import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
  HttpStatus,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseHandlerService } from 'src/services';

export function SerializeIncludes(dto: any) {
  return UseInterceptors(new SerializeInterceptor(dto));
}
export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let res: any;
    // return next.handle().pipe(
    //   map((data: any) => {
    //     res = plainToClass(this.dto, data, { exposeUnsetFields: true });
    //     return ResponseHandlerService({
    //       success: true,
    //       httpCode: HttpStatus.OK,
    //       message: 'Product found',
    //       data: res,
    //     });
    //   }),
    // );
    return next.handle().pipe(
      map((data: any) => {
        return plainToClass(this.dto, data, { exposeUnsetFields: true });
      }),
    );
  }
}
