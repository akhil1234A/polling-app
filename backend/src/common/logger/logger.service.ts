import { Injectable, LoggerService, Logger } from '@nestjs/common';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger = new Logger('AppLogger');

  log(message: string, metaOrContext?: string | Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      this.logger.log(message);
    } else if (typeof metaOrContext === 'object') {
      this.logger.log(`${message} — ${JSON.stringify(metaOrContext)}`);
    } else {
      this.logger.log(message, metaOrContext);
    }
  }

  error(
    message: string,
    trace?: string,
    contextOrMeta?: string | Record<string, any>,
  ) {
    if (process.env.NODE_ENV === 'development') {
      this.logger.error(message, trace);
    } else if (typeof contextOrMeta === 'object') {
      this.logger.error(`${message} — ${JSON.stringify(contextOrMeta)}`, trace);
    } else {
      this.logger.error(message, trace, contextOrMeta);
    }
  }

  warn(message: string, contextOrMeta?: string | Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      this.logger.warn(message);
    } else if (typeof contextOrMeta === 'object') {
      this.logger.warn(`${message} — ${JSON.stringify(contextOrMeta)}`);
    } else {
      this.logger.warn(message, contextOrMeta);
    }
  }

  debug(message: string, contextOrMeta?: string | Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(message);
    } else if (typeof contextOrMeta === 'object') {
      this.logger.debug(`${message} — ${JSON.stringify(contextOrMeta)}`);
    } else {
      this.logger.debug(message, contextOrMeta);
    }
  }

  verbose(message: string, contextOrMeta?: string | Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      this.logger.verbose(message);
    } else if (typeof contextOrMeta === 'object') {
      this.logger.verbose(`${message} — ${JSON.stringify(contextOrMeta)}`);
    } else {
      this.logger.verbose(message, contextOrMeta);
    }
  }
}
