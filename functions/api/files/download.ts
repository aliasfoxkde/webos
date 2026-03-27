/**
 * Download file endpoint - download a file from R2.
 */
import { verifyToken } from '../auth/login';

interface DownloadResponse {
  ok: boolean;
  content?: string;
  metadata?: { size: number; type: string; lastModified: string };
  error?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const token = context.request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return Response.json({ ok: false, error: 'Unauthorized' } satisfies DownloadResponse, { status: 401 });
  }

  const userId = verifyToken(token);
  if (!userId) {
    return Response.json({ ok: false, error: 'Invalid token' } satisfies DownloadResponse, { status: 401 });
  }

  const url = new URL(context.request.url);
  const filePath = url.searchParams.get('path');
  if (!filePath) {
    return Response.json({ ok: false, error: 'Missing path parameter' } satisfies DownloadResponse, { status: 400 });
  }

  const cleanPath = filePath.replace(/^\/+|\/+$/g, '');
  const key = `${userId}/${cleanPath}`;

  try {
    const object = await context.env.FILES.get(key);

    if (!object) {
      return Response.json({ ok: false, error: 'File not found' } satisfies DownloadResponse, { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Content-Disposition', `inline; filename="${cleanPath.split('/').pop()}"`);

    return new Response(object.body, { headers });
  } catch (err) {
    return Response.json({
      ok: false,
      error: `Download failed: ${(err as Error).message}`,
    } satisfies DownloadResponse, { status: 500 });
  }
};
