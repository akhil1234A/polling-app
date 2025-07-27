import { z } from 'zod';
import { ZodValidationPipe } from '../../common/validation/zod-pipe';

export const updatePollSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty').optional(),
  options: z
    .array(z.string().min(1, 'Option cannot be empty'))
    .min(2, 'At least two options required')
    .refine((options) => new Set(options).size === options.length, {
      message: 'Options must be unique',
      path: ['options'],
    })
    .optional(),
  durationMinutes: z
    .number()
    .min(1, 'Minimum 1 minute')
    .max(120, 'Maximum 2 hours')
    .optional(),
  isPrivate: z.boolean().optional(),
  allowedUsers: z.array(z.email('Invalid email')).optional(),
});

export class UpdatePollDto {
  question?: string;
  options?: string[];
  durationMinutes?: number;
  isPrivate?: boolean;
  allowedUsers?: string[];
}

export const updatePollPipe = new ZodValidationPipe(
  updatePollSchema.transform((val) => ({
    ...val,
    expiresAt: val.durationMinutes
      ? new Date(Date.now() + val.durationMinutes * 60 * 1000)
      : undefined,
  })),
);
