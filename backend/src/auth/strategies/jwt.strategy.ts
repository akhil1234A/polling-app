import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../JwtPayload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          request?.cookies?.['accessToken'] ||
          request?.headers?.authorization?.split(' ')[1],
      ]),
      secretOrKey: configService.get('JWT_ACCESS_SECRET') as string,
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.id, email: payload.email, role: payload.role };
  }
}
