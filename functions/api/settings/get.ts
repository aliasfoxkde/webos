/**
 * Get settings endpoint - read user settings from KV.
 */
import { verifyToken } from '../auth/login';

interface SettingsResponse {
  ok: boolean;
  settings?: Record<string, string>;
  error?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const token = context.request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return Response.json({ ok: false, error: 'Unauthorized' } satisfies SettingsResponse, { status: 401 });
  }

  const userId = verifyToken(token);
  if (!userId) {
    return Response.json({ ok: false, error: 'Invalid token' } satisfies SettingsResponse, { status: 401 });
  }

  try {
    const data = await context.env.SETTINGS.get(`${userId}:settings`, 'json');
    return Response.json({
      ok: true,
      settings: (data as Record<string, string>) ?? {},
    } satisfies SettingsResponse);
  } catch (err) {
    return Response.json({
      ok: false,
      error: `Failed to get settings: ${(err as Error).message}`,
    } satisfies SettingsResponse, { status: 500 });
  }
};
