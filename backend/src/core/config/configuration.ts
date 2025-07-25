import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './env.validation';

@Injectable()
export class ConfigurationService {
  constructor(private readonly configService: ConfigService<EnvConfig, true>) {}

  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.configService.get(key, { infer: true });
  }

  get port() {
    return this.get('PORT');
  }

  get jwtAccessSecret() {
    return this.get('JWT_ACCESS_SECRET');
  }

  get isProduction() {
    return this.get('NODE_ENV') === 'production';
  }
}
