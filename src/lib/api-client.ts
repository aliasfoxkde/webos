/**
 * API client for Cloudflare Pages Functions.
 */
const BASE_URL = '/api';

function getHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(token),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    request<{ ok: boolean; token?: string; user?: { id: string; username: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ username, password }) },
    ),

  register: (username: string, password: string) =>
    request<{ ok: boolean; token?: string; user?: { id: string; username: string } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ username, password }) },
    ),

  verify: (token: string) =>
    request<{ ok: boolean; valid: boolean; userId?: string }>(
      '/auth/verify',
      { method: 'POST', body: JSON.stringify({ token }) },
    ),
};

// Files API
export const filesApi = {
  list: (token: string, prefix?: string) => {
    const params = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
    return request<{ ok: boolean; files?: Array<{ key: string; size: number; lastModified: string }> }>(
      `/files/list${params}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },

  upload: (token: string, path: string, content: ArrayBuffer | string, mimeType?: string) =>
    request<{ ok: boolean; key?: string }>(
      `/files/upload?path=${encodeURIComponent(path)}`,
      {
        method: 'PUT',
        body: typeof content === 'string' ? content : content,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': mimeType ?? 'application/octet-stream',
        },
      },
    ),

  download: (token: string, path: string) =>
    fetch(`${BASE_URL}/files/download?path=${encodeURIComponent(path)}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  delete: (token: string, path: string) =>
    request<{ ok: boolean }>(
      `/files/delete?path=${encodeURIComponent(path)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      },
    ),

  metadata: (token: string, path: string) =>
    request<{
      ok: boolean;
      metadata?: { size: number; type: string; lastModified: string };
    }>(
      `/files/metadata?path=${encodeURIComponent(path)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    ),
};

// Settings API
export const settingsApi = {
  get: (token: string) =>
    request<{ ok: boolean; settings?: Record<string, string> }>(
      '/settings/get',
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  set: (token: string, settings: Record<string, string>) =>
    request<{ ok: boolean }>(
      '/settings/set',
      {
        method: 'PUT',
        body: JSON.stringify({ settings }),
        headers: { Authorization: `Bearer ${token}` },
      },
    ),
};
