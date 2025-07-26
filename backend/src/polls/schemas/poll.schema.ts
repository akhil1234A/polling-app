import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PollDocument = HydratedDocument<Poll>;

@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class Poll {
  id?: string;

  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ type: String, required: true })
  createdBy: string;

  @Prop({ type: Date })
  expiresAt?: Date;

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return this._id.toHexString();
});

// Minimal index for performance
PollSchema.index({ createdBy: 1, isActive: 1 });
