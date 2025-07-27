import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { PollsModule } from './polls/polls.module';
import { HealthModule } from './health.module';

@Module({
  imports: [CoreModule, AuthModule, PollsModule, HealthModule],
})
export class AppModule {}
