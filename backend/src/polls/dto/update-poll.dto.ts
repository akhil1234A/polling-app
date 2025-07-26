import { z } from 'zod';
import { ZodValidationPipe } from '../../common/validation/zod-pipe';

export const updatePollSchema = z
  .object({
    question: z.string().min(1, 'Question cannot be empty').optional(),
    options: z
      .array(z.string().min(1, 'Option cannot be empty'))
      .min(2, 'At least two options required')
      .optional(),
    expiresAt: z.string().datetime().optional(),
    isPrivate: z.boolean().optional(),
    allowedUsers: z.array(z.string().min(1)).optional(),
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

export class UpdatePollDto {
  question?: string;
  options?: string[];
  expiresAt?: Date;
  isPrivate?: boolean;
  allowedUsers?: string[];
}

export const updatePollPipe = new ZodValidationPipe(
  updatePollSchema.transform((val) => ({
    ...val,
    expiresAt: val.expiresAt ? new Date(val.expiresAt) : undefined,
  })),
);
