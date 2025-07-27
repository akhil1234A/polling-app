export interface User {
  email: string;
  role: 'user' | 'admin';
}

export interface Poll {
  _id: string;
  question: string;
  options: string[];
  createdBy: string;
  expiresAt: string;
  isActive: boolean;
  votes: { userId: string; option: string }[];
  isPrivate: boolean;
  allowedUsers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePollDto {
  question: string;
  options: string[];
  durationMinutes: number;
  isPrivate: boolean;
  allowedUsers: string[];
}

export interface UpdatePollDto {
  question?: string;
  options?: string[];
  durationMinutes?: number;
  isPrivate?: boolean;
  allowedUsers?: string[];
}

export interface VoteDto {
  option: string;
}