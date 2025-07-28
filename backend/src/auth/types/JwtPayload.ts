export interface JwtPayload {
  id: string;
  email: string;
  role: 'admin' | 'user';
}
