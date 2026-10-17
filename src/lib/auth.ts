import { apiFetch, setAccessToken } from './client-api';
import type { RegisterData, User } from '@/types/api';

export const loginRequest = async (email: string, password: string) => {
  const { accessToken } = await apiFetch<{ accessToken: string }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) },
  );
  setAccessToken(accessToken);
};

// бекенд після реєстрації не створює сесію, тому одразу входимо
export const registerRequest = async (data: RegisterData) => {
  await apiFetch<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  await loginRequest(data.email, data.password);
};

export const logoutRequest = async () => {
  await apiFetch<null>('/auth/logout', { method: 'POST' });
  setAccessToken(null);
};

export const getCurrentUser = () => apiFetch<User>('/auth/current');