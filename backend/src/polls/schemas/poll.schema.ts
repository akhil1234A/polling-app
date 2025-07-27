import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PollDocument = HydratedDocument<Poll>;

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Poll {
  id?: string;

  @Prop({ required: true, trim: true })
  question: string;

  @Prop({
    type: [String],
    required: true,
    validate: {
      validator: (options: string[]) =>
        options.length >= 2 && new Set(options).size === options.length,
      message: 'At least two unique options required',
    },
  })
  options: string[];

  @Prop({ type: String, required: true })
  createdBy: string;

  @Prop()
  expiresAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [{ userId: String, option: String }], default: [] })
  votes: { userId: string; option: string }[];

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ type: [String], default: [] })
  allowedUsers: string[];
}

export const PollSchema = SchemaFactory.createForClass(Poll);

PollSchema.virtual('id').get(function () {
  return this._id.toHexString() as string;
});

PollSchema.index({ createdBy: 1, isActive: 1 });
PollSchema.index({ 'votes.userId': 1 });
