import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigurationService } from './configuration';
import { validateEnv } from './validate-env';

const validatedEnv = validateEnv();

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [() => validatedEnv],
    }),
  ],
  providers: [ConfigurationService],
  exports: [ConfigurationService],
})
export class ConfigModule {}
