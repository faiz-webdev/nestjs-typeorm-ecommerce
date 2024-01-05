// src/common/filters/validation.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHandlerService } from 'src/services';

@Catch(HttpException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    if (status === 400 && exceptionResponse.message) {
      // Handle class-validator validation errors
      const errors = exceptionResponse.message;
      //   const formattedErrors = this.formatErrors(errors);

      return response.status(status).json(
        ResponseHandlerService({
          success: false,
          httpCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          data: errors,
        }),
      );

      return response.status(status).json({
        statusCode: status,
        message: 'Validation failed',
        // errors: formattedErrors,
        errors: exceptionResponse.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Handle other types of errors
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private formatErrors(errors: any[]) {
    return errors.map((error) => {
      const constraints = error.constraints;
      return {
        field: error.property,
        constraints: Object.values(constraints),
      };
    });
  }
}
