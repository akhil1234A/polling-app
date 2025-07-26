import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PollsRepository } from './polls.repository';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { VoteDto } from './dto/vote.dto';
import { MESSAGES } from '../common/constants/messages';
import { AppLogger } from '../common/logger/logger.service';
import { JwtPayload } from '../auth/JwtPayload';
import { Poll } from './schemas/poll.schema';

@Injectable()
export class PollsService {
  constructor(
    private readonly pollsRepository: PollsRepository,
    private readonly logger: AppLogger,
  ) {}

  async create(createPollDto: CreatePollDto, userId: string): Promise<Poll> {
    this.logger.log('Creating poll', {
      userId,
      question: createPollDto.question,
    });
    const poll = await this.pollsRepository.create({
      ...createPollDto,
      createdBy: userId,
      isActive: true,
      votes: [],
      isPrivate: createPollDto.isPrivate,
      allowedUsers: createPollDto.allowedUsers,
    });
    this.logger.log('Poll created', { pollId: poll.id, userId });
    return poll;
  }

  async findAll(user: JwtPayload): Promise<Poll[]> {
    this.logger.log('Retrieving polls for user', { userId: user.id });
    const polls = await this.pollsRepository.findAll(user.id, user.role);
    const filteredPolls = polls.filter((poll) => {
      if (poll.expiresAt && poll.expiresAt < new Date()) {
        poll.isActive = false;
        if (!poll.id) throw Error('poll id required');
        this.pollsRepository.update(poll.id, { isActive: false });
        return false;
      }
      return true;
    });
    this.logger.log('Polls retrieved', { count: filteredPolls.length });
    return filteredPolls;
  }

  async findOne(id: string, user: JwtPayload): Promise<Poll> {
    this.logger.log('Retrieving poll', { pollId: id, userId: user.id });
    const poll = await this.pollsRepository.findOne(id, user.id, user.role);
    if (!poll) {
      this.logger.warn('Poll not found or unauthorized', {
        pollId: id,
        userId: user.id,
      });
      throw new NotFoundException(MESSAGES.POLL_NOT_FOUND);
    }
    if (poll.expiresAt && poll.expiresAt < new Date()) {
      poll.isActive = false;
      await this.pollsRepository.update(id, { isActive: false });
      this.logger.warn('Poll is expired', { pollId: id });
      throw new BadRequestException(MESSAGES.POLL_EXPIRED);
    }
    this.logger.log('Poll retrieved', { pollId: id });
    return poll;
  }

  async update(
    id: string,
    updatePollDto: UpdatePollDto,
    user: JwtPayload,
  ): Promise<Poll> {
    this.logger.log('Updating poll', { pollId: id, userId: user.id });
    const poll = await this.pollsRepository.findOne(id, user.id, user.role);
    if (!poll) {
      this.logger.warn('Poll not found', { pollId: id });
      throw new NotFoundException(MESSAGES.POLL_NOT_FOUND);
    }
    if (!poll.isActive) {
      this.logger.warn('Cannot update expired poll', { pollId: id });
      throw new BadRequestException(MESSAGES.POLL_EXPIRED);
    }
    if (poll.createdBy !== user.id && user.role !== 'admin') {
      this.logger.warn('Unauthorized poll update attempt', {
        pollId: id,
        userId: user.id,
      });
      throw new ForbiddenException(MESSAGES.UNAUTHORIZED);
    }
    const updatedPoll = await this.pollsRepository.update(id, updatePollDto);
    this.logger.log('Poll updated', { pollId: id, userId: user.id });
    return updatedPoll;
  }

  async remove(id: string, user: JwtPayload): Promise<void> {
    this.logger.log('Deleting poll', { pollId: id, userId: user.id });
    const poll = await this.pollsRepository.findOne(id, user.id, user.role);
    if (!poll) {
      this.logger.warn('Poll not found', { pollId: id });
      throw new NotFoundException(MESSAGES.POLL_NOT_FOUND);
    }
    if (poll.createdBy !== user.id && user.role !== 'admin') {
      this.logger.warn('Unauthorized poll deletion attempt', {
        pollId: id,
        userId: user.id,
      });
      throw new ForbiddenException(MESSAGES.UNAUTHORIZED);
    }
    await this.pollsRepository.remove(id);
    this.logger.log('Poll deleted', { pollId: id, userId: user.id });
  }

  async vote(id: string, voteDto: VoteDto, userId: string): Promise<Poll> {
    this.logger.log('Processing vote', {
      pollId: id,
      userId,
      option: voteDto.option,
    });
    const poll = await this.pollsRepository.findOne(id, userId, 'user');
    if (!poll) {
      this.logger.warn('Poll not found or unauthorized', {
        pollId: id,
        userId,
      });
      throw new NotFoundException(MESSAGES.POLL_NOT_FOUND);
    }
    if (!poll.isActive) {
      this.logger.warn('Poll is expired', { pollId: id });
      throw new BadRequestException(MESSAGES.POLL_EXPIRED);
    }
    if (!poll.options.includes(voteDto.option)) {
      this.logger.warn('Invalid poll option', {
        pollId: id,
        option: voteDto.option,
      });
      throw new BadRequestException(MESSAGES.INVALID_OPTION);
    }
    if (poll.votes.some((vote) => vote.userId === userId)) {
      this.logger.warn('User has already voted', { pollId: id, userId });
      throw new BadRequestException(MESSAGES.POLL_ALREADY_VOTED);
    }
    const updatedPoll = await this.pollsRepository.addVote(id, {
      userId,
      option: voteDto.option,
    });
    this.logger.log('Vote recorded', {
      pollId: id,
      userId,
      option: voteDto.option,
    });
    return updatedPoll;
  }
}
