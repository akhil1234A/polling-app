import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../JwtPayload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token =
            request?.cookies?.['accessToken'] ||
            (request?.headers?.authorization?.startsWith('Bearer ')
              ? request.headers.authorization.split(' ')[1]
              : null);
          this.logger.debug(
            `Extracted accessToken: ${token ? 'present' : 'missing'}`,
          );
          return token;
        },
      ]),
      secretOrKey: configService.get('JWT_ACCESS_SECRET') as string,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload) {
    this.logger.debug(`Validated payload: ${JSON.stringify(payload)}`);
    return { id: payload.id, email: payload.email, role: payload.role };
  }
}
