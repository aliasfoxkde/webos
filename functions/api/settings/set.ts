/**
 * Set settings endpoint - write user settings to KV.
 */
import { verifyToken } from '../auth/login';

interface SetSettingsRequest {
  settings: Record<string, string>;
}

interface SettingsResponse {
  ok: boolean;
  error?: string;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const token = context.request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return Response.json({ ok: false, error: 'Unauthorized' } satisfies SettingsResponse, { status: 401 });
  }

  const userId = verifyToken(token);
  if (!userId) {
    return Response.json({ ok: false, error: 'Invalid token' } satisfies SettingsResponse, { status: 401 });
  }

  const { settings } = (await context.request.json()) as SetSettingsRequest;

  if (!settings || typeof settings !== 'object') {
    return Response.json({ ok: false, error: 'Invalid settings object' } satisfies SettingsResponse, { status: 400 });
  }

  try {
    await context.env.SETTINGS.put(`${userId}:settings`, JSON.stringify(settings));
    return Response.json({ ok: true } satisfies SettingsResponse);
  } catch (err) {
    return Response.json({
      ok: false,
      error: `Failed to save settings: ${(err as Error).message}`,
    } satisfies SettingsResponse, { status: 500 });
  }
};
