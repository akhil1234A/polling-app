import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { STATUS_CODES } from '../constants/status-codes';
import { MESSAGES } from '../constants/messages';
import { MongoError } from 'mongodb';
import { MongooseError } from 'mongoose';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = MESSAGES.INTERNAL_SERVER_ERROR;
    let errors = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      const isObject =
        typeof responseBody === 'object' && responseBody !== null;
      message = isObject
        ? (responseBody as any).message || MESSAGES.INTERNAL_SERVER_ERROR
        : responseBody;
      errors =
        isObject && 'errors' in responseBody
          ? (responseBody as any).errors
          : undefined;
    } else if (
      exception instanceof MongooseError ||
      exception instanceof MongoError
    ) {
      status = HttpStatus.BAD_REQUEST;
      message = `Database error: ${exception.message}`;
      if (
        exception instanceof MongooseError &&
        exception.name === 'ValidationError'
      ) {
        errors = Object.values((exception as any).errors).map((err: any) => ({
          field: err.path,
          message: err.message,
        }));
      }
    } else if (exception instanceof Error) {
      message = `Unexpected error: ${exception.message}`;
    }

    this.logger.error(`Error occurred: ${message}`, {
      status,
      path: request.url,
      method: request.method,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json({
      statusCode: status,
      message,
      error: STATUS_CODES[status] || 'Internal Server Error',
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
