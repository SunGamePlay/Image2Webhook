export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const resp = await fetch(url, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...options,
  });

  if (resp.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.detail || `HTTP ${resp.status}`);
  }

  return data as T;
}
