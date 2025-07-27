import { CookieOptions } from 'express';

export const getCookieOptions = (isProduction: boolean): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
});
