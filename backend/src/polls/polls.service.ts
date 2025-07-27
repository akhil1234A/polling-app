import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PollsRepository } from './polls.repository';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { VoteDto } from './dto/vote.dto';
import { MESSAGES } from '../common/constants/messages';
import { JwtPayload } from '../auth/JwtPayload';
import { Poll } from './schemas/poll.schema';
import { MongoError } from 'mongodb';
import { MongooseError } from 'mongoose';

@Injectable()
export class PollsService {
  private readonly logger = new Logger(PollsService.name);

  constructor(private readonly pollsRepository: PollsRepository) {}

  async create(createPollDto: CreatePollDto, userId: string): Promise<Poll> {
    try {
      this.logger.log('Creating poll', {
        userId,
        question: createPollDto.question,
      });
      const expiresAt = new Date(
        Date.now() + createPollDto.durationMinutes * 60 * 1000,
      );
      const poll = await this.pollsRepository.create({
        ...createPollDto,
        createdBy: userId,
        isActive: true,
        votes: [],
        expiresAt,
      });
      this.logger.log('Poll created', { pollId: poll._id, userId });
      return poll;
    } catch (error) {
      this.logger.error('Failed to create poll', {
        error: error.message,
        userId,
      });
      if (error instanceof MongooseError || error instanceof MongoError) {
        throw new BadRequestException(
          `Failed to create poll: ${error.message}`,
        );
      }
      throw error;
    }
  }

  async findAll(
    user: JwtPayload,
    filters: { voted?: string; status?: string; visibility?: string },
  ): Promise<Poll[]> {
    try {
      this.logger.log('Retrieving polls for user', {
        userId: user.id,
        filters,
      });
      const query: any = {};
      if (filters.voted === 'true') {
        query['votes.userId'] = user.id;
      } else if (user.role !== 'admin') {
        query.$or = [
          { isPrivate: false },
          { isPrivate: true, allowedUsers: user.id },
          { createdBy: user.id },
        ];
      }
      if (filters.status === 'active') query.isActive = true;
      if (filters.status === 'expired') query.isActive = false;
      if (filters.visibility === 'public') query.isPrivate = false;
      if (filters.visibility === 'private') query.isPrivate = true;

      const polls = await this.pollsRepository.findAllWithFilters(
        user.id,
        user.role,
        query,
      );
      const updatedPolls = await Promise.all(
        polls.map(async (poll) => {
          if (poll.expiresAt && poll.expiresAt < new Date() && poll.isActive) {
            poll.isActive = false;
            await this.pollsRepository.update(poll._id || '', {
              isActive: false,
            });
          }
          return poll;
        }),
      );
      this.logger.log('Polls retrieved', { count: updatedPolls.length });
      return updatedPolls;
    } catch (error) {
      this.logger.error('Failed to retrieve polls', {
        error: error.message,
        userId: user.id,
      });
      throw new BadRequestException(
        `Failed to retrieve polls: ${error.message}`,
      );
    }
  }

  async findOne(id: string, user: JwtPayload): Promise<Poll> {
    try {
      this.logger.log('Retrieving poll', { pollId: id, userId: user.id });
      const poll = await this.pollsRepository.findOne(id, user.id, user.role);
      if (!poll) {
        this.logger.warn('Poll not found or unauthorized', {
          pollId: id,
          userId: user.id,
        });
        throw new NotFoundException(MESSAGES.POLL_NOT_FOUND);
      }
      if (poll.expiresAt && poll.expiresAt < new Date() && poll.isActive) {
        poll.isActive = false;
        await this.pollsRepository.update(id, { isActive: false });
      }
      this.logger.log('Poll retrieved', { pollId: id });
      return poll;
    } catch (error) {
      this.logger.error('Failed to retrieve poll', {
        error: error.message,
        pollId: id,
        userId: user.id,
      });
      throw new BadRequestException(
        `Failed to retrieve poll: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updatePollDto: UpdatePollDto,
    user: JwtPayload,
  ): Promise<Poll> {
    try {
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
    } catch (error) {
      this.logger.error('Failed to update poll', {
        error: error.message,
        pollId: id,
        userId: user.id,
      });
      throw new BadRequestException(`Failed to update poll: ${error.message}`);
    }
  }

  async remove(id: string, user: JwtPayload): Promise<void> {
    try {
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
    } catch (error) {
      this.logger.error('Failed to delete poll', {
        error: error.message,
        pollId: id,
        userId: user.id,
      });
      throw new BadRequestException(`Failed to delete poll: ${error.message}`);
    }
  }

  async vote(id: string, voteDto: VoteDto, userId: string): Promise<Poll> {
    try {
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
    } catch (error) {
      this.logger.error('Failed to record vote', {
        error: error.message,
        pollId: id,
        userId,
      });
      throw new BadRequestException(`Failed to record vote: ${error.message}`);
    }
  }
}
