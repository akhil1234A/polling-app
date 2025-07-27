import api from './api';
import { User } from './types';
import { setCookie, deleteCookie } from 'cookies-next';

export const register = async (email: string, password: string) => {
  const response = await api.post('/auth/register', { email, password });
  const { accessToken, user } = response.data;
  setCookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict' });
  localStorage.setItem('user', JSON.stringify(user));
  return user as User;
};

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { accessToken, user } = response.data;
  setCookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict' });
  localStorage.setItem('user', JSON.stringify(user));
  return user as User;
};

export const logout = () => {
  deleteCookie('accessToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};