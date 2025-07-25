import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger.module';

@Module({
  imports: [CoreModule, AuthModule, LoggerModule],
})
export class AppModule {}
