import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug('No roles required, allowing access');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('No user found in request, denying access');
      throw new ForbiddenException('User not authenticated');
    }

    const userRole = user.role;
    if (!userRole || typeof userRole !== 'string') {
      this.logger.warn(`Invalid or missing user role: ${JSON.stringify(user)}`);
      throw new ForbiddenException('Invalid user role');
    }

    const hasRole = requiredRoles.includes(userRole);
    this.logger.debug(
      `Role check: User role=${userRole}, Required roles=${requiredRoles.join(', ')}, Access=${hasRole ? 'granted' : 'denied'}`,
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Role ${userRole} not authorized for this action`,
      );
    }

    return true;
  }
}
