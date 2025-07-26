import { z } from 'zod';
import { ZodValidationPipe } from '../../common/validation/zod-pipe';

export const createPollSchema = z
  .object({
    question: z.string().min(1, 'Question is required'),
    options: z
      .array(z.string().min(1, 'Option cannot be empty'))
      .min(2, 'At least two options required'),
    expiresAt: z.string().datetime().optional(),
    isPrivate: z.boolean().optional().default(false),
    allowedUsers: z.array(z.string().min(1)).optional().default([]),
  })
  .refine(
    (data) => {
      if (data.expiresAt) {
        const expiry = new Date(data.expiresAt);
        const now = new Date();
        const maxExpiry = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
        return expiry <= maxExpiry;
      }
      return true;
    },
    {
      message: 'Poll expiry cannot exceed 2 hours',
      path: ['expiresAt'],
    },
  );

export class CreatePollDto {
  question: string;
  options: string[];
  expiresAt?: Date;
  isPrivate: boolean;
  allowedUsers: string[];
}

export const createPollPipe = new ZodValidationPipe(
  createPollSchema.transform((val) => ({
    ...val,
    expiresAt: val.expiresAt ? new Date(val.expiresAt) : undefined,
  })),
);
