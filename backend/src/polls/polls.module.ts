import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { PollsRepository } from './polls.repository';
import { Poll, PollSchema } from './schemas/poll.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Poll.name, schema: PollSchema }]),
    AuthModule,
  ],
  controllers: [PollsController],
  providers: [PollsService, PollsRepository],
})
export class PollsModule {}
