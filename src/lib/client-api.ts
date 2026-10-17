import { ApiError } from './api';

// accessToken живе лише в пам'яті вкладки: після перезавантаження
// сторінки беремо новий через refresh-cookie
let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const send = (path: string, init: RequestInit) => {
  const headers = new Headers(init.headers);
  if (typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return fetch(`/api${path}`, { ...init, headers });
};

// refresh-токен одноразовий: якщо кілька запитів одночасно отримали 401,
// усі вони чекають один спільний запит на /auth/refresh
export const refreshSession = () => {
  refreshPromise ??= fetch('/api/auth/refresh', { method: 'POST' })
    .then(async (res) => {
      const body = await res.json().catch(() => null);
      accessToken = res.ok ? body.data.accessToken : null;
      return accessToken;
    })
    .catch(() => (accessToken = null))
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

// запит до бекенду з браузера: підставляє токен, а якщо він протух (401),
// один раз оновлює сесію і повторює запит
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let res = await send(path, init);

  if (res.status === 401 && !path.startsWith('/auth/')) {
    const token = await refreshSession();
    if (token) res = await send(path, init);
  }

  // у 204 (наприклад, logout) тіла немає
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.message ?? res.statusText,
      body?.errors,
    );
  }

  return body?.data as T;
}