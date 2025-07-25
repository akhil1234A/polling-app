import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { STATUS_CODES } from '../constants/status-codes';
import { MESSAGES } from '../constants/messages';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : MESSAGES.INTERNAL_SERVER_ERROR;

    const isObject = typeof responseBody === 'object' && responseBody !== null;

    const message = isObject
      ? (responseBody as any).message || MESSAGES.INTERNAL_SERVER_ERROR
      : responseBody;

    const errors =
      isObject && 'errors' in responseBody
        ? (responseBody as any).errors
        : undefined;

    response.status(status).json({
      statusCode: status,
      message,
      error: STATUS_CODES[status] || 'Internal Server Error',
      ...(errors ? { errors } : {}),
    });
  }
}
