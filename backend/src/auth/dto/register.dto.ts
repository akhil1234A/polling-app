import { z } from 'zod';
import { ZodValidationPipe } from '../../common/validation/zod-pipe';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export class RegisterDto {
  email: string;
  password: string;
}

export const registerPipe = new ZodValidationPipe(registerSchema);
