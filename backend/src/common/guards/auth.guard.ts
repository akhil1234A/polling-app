import {
  Injectable,
  UnauthorizedException,
  Logger,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      this.logger.debug('Public route, allowing access');
      return true;
    }

    this.logger.debug('Authenticating with JWT strategy');
    return super.canActivate(context);
  }
}
