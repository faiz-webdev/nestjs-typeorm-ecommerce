import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { ResponseHandlerService } from './services';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter extends HttpException {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 500) {
      response.status(status).json(
        ResponseHandlerService({
          success: false,
          httpCode: exception.getStatus(),
          message: `An error has occured in server. Please check immediately.`,
          errorDetails: exception.getResponse(),
        }),
      );
    }
    if (status === 404) {
      response.status(status).json(
        ResponseHandlerService({
          success: false,
          httpCode: exception.getStatus(),
          message: `API not found`,
        }),
      );
    }
    if (status === 400) {
      // Bad request (possible error from class validator)
      const classValidatorMessage: string =
        typeof exception.getResponse()['message'] === 'object'
          ? exception.getResponse()['message'][0]
          : exception.getResponse()['message'];

      response.status(200).json(
        ResponseHandlerService({
          success: false,
          httpCode: exception.getStatus(),
          message: classValidatorMessage,
          errorDetails: exception.getResponse(),
        }),
      );
    } else {
      response.status(200).json(
        ResponseHandlerService({
          success: false,
          httpCode: exception.getStatus(),
          message: 'classValidatorMessage',
          errorDetails: exception.getResponse(),
        }),
      );
    }
  }
}
