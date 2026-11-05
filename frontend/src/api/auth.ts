import { apiFetch } from './client';
import { User } from '../types/auth';

export async function checkSessionApi(): Promise<User> {
  return apiFetch<User>('/api/me');
}

export async function loginApi(username: string, password: string): Promise<User> {
  return apiFetch<User>('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      password,
      disclaimer_accepted: true,
    }),
  });
}

export async function logoutApi(): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>('/api/logout', {
    method: 'POST',
  });
}
