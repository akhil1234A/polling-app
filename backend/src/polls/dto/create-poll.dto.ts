import { z } from 'zod';
import { ZodValidationPipe } from '../../common/validation/zod-pipe';

export const createPollSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  options: z
    .array(z.string().min(1, 'Option cannot be empty'))
    .min(2, 'At least two options required')
    .refine((options) => new Set(options).size === options.length, {
      message: 'Options must be unique',
      path: ['options'],
    }),
  durationMinutes: z
    .number()
    .min(1, 'Minimum 1 minute')
    .max(120, 'Maximum 2 hours'),
  isPrivate: z.boolean().optional().default(false),
  allowedUsers: z.array(z.email('Invalid email')).optional().default([]),
});

export class CreatePollDto {
  question: string;
  options: string[];
  durationMinutes: number;
  isPrivate: boolean;
  allowedUsers: string[];
}

export const createPollPipe = new ZodValidationPipe(
  createPollSchema.transform((val) => ({
    ...val,
    expiresAt: new Date(Date.now() + val.durationMinutes * 60 * 1000),
  })),
);
