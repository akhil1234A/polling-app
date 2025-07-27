import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Res,
  HttpStatus,
  UseGuards,
  UsePipes,
  Query,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto, updatePollPipe } from './dto/update-poll.dto';
import { VoteDto, votePipe } from './dto/vote.dto';
import { User } from '../common/decorators/user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/role.decorator';
import { MESSAGES } from '../common/constants/messages';
import { JwtPayload } from '../auth/JwtPayload';

@Controller('polls')
@UseGuards(AuthGuard, RolesGuard)
export class PollsController {
  private readonly logger = new Logger(PollsController.name);

  constructor(private readonly pollsService: PollsService) {}

  @Roles('admin')
  @Post()
  async create(
    @Body() createPollDto: CreatePollDto,
    @User() user: JwtPayload,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Poll creation request', {
        userId: user.id,
        body: createPollDto,
      });
      console.log('Incoming CreatePollDto:', createPollDto);
      const poll = await this.pollsService.create(createPollDto, user.id);
      return res
        .status(HttpStatus.CREATED)
        .json({ poll, message: MESSAGES.POLL_CREATED });
    } catch (error) {
      this.logger.error('Failed to create poll', {
        error: error.message,
        userId: user.id,
      });
      throw error; // Handled by HttpExceptionFilter
    }
  }

  @Roles('user', 'admin')
  @Get()
  async findAll(
    @User() user: JwtPayload,
    @Query('voted') voted: string,
    @Query('status') status: string,
    @Query('visibility') visibility: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('List polls request', {
        userId: user.id,
        filters: { voted, status, visibility },
      });
      const polls = await this.pollsService.findAll(user, {
        voted,
        status,
        visibility,
      });
      return res.status(HttpStatus.OK).json({ polls });
    } catch (error) {
      this.logger.error('Failed to list polls', {
        error: error.message,
        userId: user.id,
      });
      throw error;
    }
  }

  @Roles('user', 'admin')
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @User() user: JwtPayload,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Poll retrieval request', {
        pollId: id,
        userId: user.id,
      });
      const poll = await this.pollsService.findOne(id, user);
      return res.status(HttpStatus.OK).json({ poll });
    } catch (error) {
      this.logger.error('Failed to retrieve poll', {
        error: error.message,
        pollId: id,
        userId: user.id,
      });
      throw error;
    }
  }

  @Roles('admin')
  @Patch(':id')
  // @UsePipes(updatePollPipe)
  async update(
    @Param('id') id: string,
    @Body() updatePollDto: UpdatePollDto,
    @User() user: JwtPayload,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Poll update request', { pollId: id, userId: user.id });
      const poll = await this.pollsService.update(id, updatePollDto, user);
      return res
        .status(HttpStatus.OK)
        .json({ poll, message: MESSAGES.POLL_UPDATED });
    } catch (error) {
      this.logger.error('Failed to update poll', {
        error: error.message,
        pollId: id,
        userId: user.id,
      });
      throw error;
    }
  }

  @Roles('admin')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @User() user: JwtPayload,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Poll deletion request', { pollId: id, userId: user.id });
      await this.pollsService.remove(id, user);
      return res.status(HttpStatus.OK).json({ message: MESSAGES.POLL_DELETED });
    } catch (error) {
      this.logger.error('Failed to delete poll', {
        error: error.message,
        pollId: id,
        userId: user.id,
      });
      throw error;
    }
  }

  @Roles('user', 'admin')
  @Post(':id/vote')
  // @UsePipes(votePipe)
  async vote(
    @Param('id') id: string,
    @Body() voteDto: VoteDto,
    @User() user: JwtPayload,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Vote request', { pollId: id, userId: user.id });
      const poll = await this.pollsService.vote(id, voteDto, user.id);
      return res
        .status(HttpStatus.OK)
        .json({ poll, message: MESSAGES.POLL_VOTE_SUCCESS });
    } catch (error) {
      this.logger.error('Failed to record vote', {
        error: error.message,
        pollId: id,
        userId: user.id,
      });
      throw error;
    }
  }
}
