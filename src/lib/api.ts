// адреса бекенду; читається лише на сервері Next.js, у браузер не потрапляє
const API_URL = process.env.API_URL ?? 'http://localhost:5000';

export class ApiError extends Error {
  status: number;
  errors?: string[];

  constructor(status: number, message: string, errors?: string[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// бекенд завжди відповідає { status, message, data }, повертаємо одразу data
export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, body?.message ?? res.statusText);
  }

  return body.data as T;
}