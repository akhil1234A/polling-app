import { z } from 'zod';
import { ZodValidationPipe } from '../../common/validation/zod-pipe';

export const voteSchema = z.object({
  option: z.string().min(1, 'Option is required'),
});

export class VoteDto {
  option: string;
}

export const votePipe = new ZodValidationPipe(voteSchema);
