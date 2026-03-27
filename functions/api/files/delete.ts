/**
 * Delete file endpoint - delete a file from R2.
 */
import { verifyToken } from '../auth/login';

interface DeleteResponse {
  ok: boolean;
  error?: string;
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const token = context.request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return Response.json({ ok: false, error: 'Unauthorized' } satisfies DeleteResponse, { status: 401 });
  }

  const userId = verifyToken(token);
  if (!userId) {
    return Response.json({ ok: false, error: 'Invalid token' } satisfies DeleteResponse, { status: 401 });
  }

  const url = new URL(context.request.url);
  const filePath = url.searchParams.get('path');
  if (!filePath) {
    return Response.json({ ok: false, error: 'Missing path parameter' } satisfies DeleteResponse, { status: 400 });
  }

  const cleanPath = filePath.replace(/^\/+|\/+$/g, '');
  const key = `${userId}/${cleanPath}`;

  try {
    await context.env.FILES.delete(key);
    return Response.json({ ok: true } satisfies DeleteResponse);
  } catch (err) {
    return Response.json({
      ok: false,
      error: `Delete failed: ${(err as Error).message}`,
    } satisfies DeleteResponse, { status: 500 });
  }
};
