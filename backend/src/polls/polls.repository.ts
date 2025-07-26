import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Poll, PollDocument } from './schemas/poll.schema';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';

@Injectable()
export class PollsRepository {
  constructor(
    @InjectModel(Poll.name) private readonly pollModel: Model<PollDocument>,
  ) {}

  async create(
    createPollDto: CreatePollDto & {
      createdBy: string;
      isActive: boolean;
      votes: any[];
      isPrivate: boolean;
      allowedUsers: string[];
    },
  ): Promise<Poll> {
    return this.pollModel.create(createPollDto);
  }

  async findAll(userId: string, role: string): Promise<Poll[]> {
    const query: any = { isActive: true };
    if (role !== 'admin') {
      query.$or = [
        { isPrivate: false },
        { isPrivate: true, allowedUsers: userId },
        { createdBy: userId },
      ];
    }
    return this.pollModel.find(query).exec();
  }

  async findOne(
    id: string,
    userId: string,
    role: string,
  ): Promise<Poll | null> {
    const query: any = { _id: id };
    if (role !== 'admin') {
      query.$or = [
        { isPrivate: false },
        { isPrivate: true, allowedUsers: userId },
        { createdBy: userId },
      ];
    }
    return this.pollModel.findOne(query).exec();
  }

  async update(
    id: string,
    updatePollDto: UpdatePollDto | { isActive: boolean },
  ): Promise<Poll> {
    const poll = await this.pollModel
      .findByIdAndUpdate(id, updatePollDto, { new: true })
      .exec();
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    return poll;
  }

  async remove(id: string): Promise<void> {
    const result = await this.pollModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Poll not found');
    }
  }

  async addVote(
    id: string,
    vote: { userId: string; option: string },
  ): Promise<Poll> {
    const poll = await this.pollModel
      .findByIdAndUpdate(id, { $push: { votes: vote } }, { new: true })
      .exec();
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    return poll;
  }
}
