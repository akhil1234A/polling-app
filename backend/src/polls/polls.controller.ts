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
} from '@nestjs/common';
import { Response } from 'express';
import { PollsService } from './polls.service';
import { CreatePollDto, createPollPipe } from './dto/create-poll.dto';
import { UpdatePollDto, updatePollPipe } from './dto/update-poll.dto';
import { VoteDto, votePipe } from './dto/vote.dto';
import { User } from '../common/decorators/user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/role.decorator';
import { MESSAGES } from '../common/constants/messages';
import { AppLogger } from '../common/logger/logger.service';
import { JwtPayload } from '../auth/JwtPayload';

@Controller('polls')
@UseGuards(AuthGuard, RolesGuard)
export class PollsController {
  constructor(
    private readonly pollsService: PollsService,
    private readonly logger: AppLogger,
  ) {}

  @Roles('admin')
  @Post()
  @UsePipes(createPollPipe)
  async create(
    @Body() createPollDto: CreatePollDto,
    @User() user: JwtPayload,
    @Res() res: Response,
  ) {
    this.logger.log('Poll creation request', { userId: user.id });
    const poll = await this.pollsService.create(createPollDto, user.id);
    return res
      .status(HttpStatus.CREATED)
      .json({ poll, message: MESSAGES.POLL_CREATED });
  }

  @Roles('user', 'admin')
  @Get()
  async findAll(@User() user: JwtPayload, @Res() res: Response) {
    this.logger.log('List polls request', { userId: user.id });
    const polls = await this.pollsService.findAll(user);
    return res.status(HttpStatus.OK).json({ polls });
  }

  @Roles('user', 'admin')
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @User() user: JwtPayload,
    @Res() res: Response,
  ) {
    this.logger.log('Poll retrieval request', { pollId: id, userId: user.id });
    const poll = await this.pollsService.findOne(id, user);
    return res.status(HttpStatus.OK).json({ poll });
  }

  @Roles('admin')
  @Patch(':id')
  @UsePipes(updatePollPipe)
  async update(
    @Param('id') id: string,
    @Body() updatePollDto: UpdatePollDto,
    @User() user: JwtPayload,
    @Res() res: Response,
  ) {
    this.logger.log('Poll update request', { pollId: id, userId: user.id });
    const poll = await this.pollsService.update(id, updatePollDto, user);
    return res
      .status(HttpStatus.OK)
      .json({ poll, message: MESSAGES.POLL_UPDATED });
  }

  @Roles('admin')
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @User() user: JwtPayload,
    @Res() res: Response,
  ) {
    this.logger.log('Poll deletion request', { pollId: id, userId: user.id });
    await this.pollsService.remove(id, user);
    return res.status(HttpStatus.OK).json({ message: MESSAGES.POLL_DELETED });
  }

  @Roles('user', 'admin')
  @Post(':id/vote')
  @UsePipes(votePipe)
  async vote(
    @Param('id') id: string,
    @Body() voteDto: VoteDto,
    @User() user: JwtPayload,
    @Res() res: Response,
  ) {
    this.logger.log('Vote request', { pollId: id, userId: user.id });
    const poll = await this.pollsService.vote(id, voteDto, user.id);
    return res
      .status(HttpStatus.OK)
      .json({ poll, message: MESSAGES.POLL_VOTE_SUCCESS });
  }
}
