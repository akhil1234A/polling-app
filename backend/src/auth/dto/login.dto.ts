import { z } from 'zod';
import { ZodValidationPipe } from '../../common/validation/zod-pipe';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export class LoginDto {
  email: string;
  password: string;
}

export const loginPipe = new ZodValidationPipe(loginSchema);
