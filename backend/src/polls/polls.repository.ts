import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Poll, PollDocument } from './schemas/poll.schema';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';

@Injectable()
export class PollsRepository {
  private readonly logger = new Logger(PollsRepository.name);

  constructor(
    @InjectModel(Poll.name) private readonly pollModel: Model<PollDocument>,
  ) {}

  async create(
    createPollDto: CreatePollDto & {
      createdBy: string;
      isActive: boolean;
      votes: { userId: string; option: string }[];
      expiresAt: Date;
    },
  ): Promise<Poll> {
    try {
      this.logger.log('Creating poll in database', {
        question: createPollDto.question,
      });
      const poll = await this.pollModel.create(createPollDto);
      this.logger.log('Poll created in database', { pollId: poll._id });
      return poll;
    } catch (error) {
      this.logger.error('Failed to create poll in database', {
        error: error.message,
      });
      throw error; // Let PollsService handle the error
    }
  }

  async findAllWithFilters(
    userId: string,
    role: string,
    query: any,
  ): Promise<Poll[]> {
    try {
      this.logger.log('Finding polls with filters', { userId, query });
      if (role !== 'admin' && !query['votes.userId']) {
        query.$or = [
          { isPrivate: false },
          { isPrivate: true, allowedUsers: userId },
          { createdBy: userId },
        ];
      }
      const polls = await this.pollModel.find(query).exec();
      this.logger.log('Polls found', { count: polls.length });
      return polls;
    } catch (error) {
      this.logger.error('Failed to find polls', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  async findOne(
    id: string,
    userId: string,
    role: string,
  ): Promise<Poll | null> {
    try {
      this.logger.log('Finding poll', { pollId: id, userId });
      const query: any = { _id: id };
      if (role !== 'admin') {
        query.$or = [
          { isPrivate: false },
          { isPrivate: true, allowedUsers: userId },
          { createdBy: userId },
        ];
      }
      const poll = await this.pollModel.findOne(query).exec();
      this.logger.log(poll ? 'Poll found' : 'Poll not found', { pollId: id });
      return poll;
    } catch (error) {
      this.logger.error('Failed to find poll', {
        error: error.message,
        pollId: id,
        userId,
      });
      throw error;
    }
  }

  async update(
    id: string,
    updatePollDto: UpdatePollDto | { isActive: boolean },
  ): Promise<Poll> {
    try {
      this.logger.log('Updating poll', { pollId: id });
      const poll = await this.pollModel
        .findByIdAndUpdate(id, updatePollDto, { new: true })
        .exec();
      if (!poll) {
        this.logger.warn('Poll not found for update', { pollId: id });
        throw new NotFoundException('Poll not found');
      }
      this.logger.log('Poll updated', { pollId: id });
      return poll;
    } catch (error) {
      this.logger.error('Failed to update poll', {
        error: error.message,
        pollId: id,
      });
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.logger.log('Deleting poll', { pollId: id });
      const result = await this.pollModel.findByIdAndDelete(id).exec();
      if (!result) {
        this.logger.warn('Poll not found for deletion', { pollId: id });
        throw new NotFoundException('Poll not found');
      }
      this.logger.log('Poll deleted', { pollId: id });
    } catch (error) {
      this.logger.error('Failed to delete poll', {
        error: error.message,
        pollId: id,
      });
      throw error;
    }
  }

  async addVote(
    id: string,
    vote: { userId: string; option: string },
  ): Promise<Poll> {
    try {
      this.logger.log('Adding vote to poll', { pollId: id, vote });
      const poll = await this.pollModel
        .findByIdAndUpdate(id, { $push: { votes: vote } }, { new: true })
        .exec();
      if (!poll) {
        this.logger.warn('Poll not found for voting', { pollId: id });
        throw new NotFoundException('Poll not found');
      }
      this.logger.log('Vote added', { pollId: id });
      return poll;
    } catch (error) {
      this.logger.error('Failed to add vote', {
        error: error.message,
        pollId: id,
      });
      throw error;
    }
  }
}
