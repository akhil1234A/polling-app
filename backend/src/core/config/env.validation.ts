import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  FRONTEND_URL: z.string().url(),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(10, 'JWT access secret must be at least 10 chars'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(10, 'JWT refresh secret must be at least 10 chars'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
});

export type EnvConfig = z.infer<typeof envSchema>;
