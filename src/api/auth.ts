import api from './axios';
import type { JwtResponse, UserDto } from '../types/auth';

export async function login(username: string, password: string) {
  const { data } = await api.post<JwtResponse>('/api/auth/login', {
    username,
    password,
  });
  localStorage.setItem('jwt', data.token);
  return data;
}

export async function whoAmI() {
  const { data } = await api.get<UserDto>('/api/auth/whoami');
  return data;
}
