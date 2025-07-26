import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger.module';
import { PollsModule } from './polls/polls.module';

@Module({
  imports: [CoreModule, AuthModule, LoggerModule, PollsModule],
})
export class AppModule {}
