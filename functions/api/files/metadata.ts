/**
 * File metadata endpoint - get metadata for a file in R2.
 */
import { verifyToken } from '../auth/login';

interface MetadataResponse {
  ok: boolean;
  metadata?: {
    size: number;
    type: string;
    lastModified: string;
    version: string;
  };
  error?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const token = context.request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return Response.json({ ok: false, error: 'Unauthorized' } satisfies MetadataResponse, { status: 401 });
  }

  const userId = verifyToken(token);
  if (!userId) {
    return Response.json({ ok: false, error: 'Invalid token' } satisfies MetadataResponse, { status: 401 });
  }

  const url = new URL(context.request.url);
  const filePath = url.searchParams.get('path');
  if (!filePath) {
    return Response.json({ ok: false, error: 'Missing path parameter' } satisfies MetadataResponse, { status: 400 });
  }

  const cleanPath = filePath.replace(/^\/+|\/+$/g, '');
  const key = `${userId}/${cleanPath}`;

  try {
    const object = await context.env.FILES.head(key);

    if (!object) {
      return Response.json({ ok: false, error: 'File not found' } satisfies MetadataResponse, { status: 404 });
    }

    return Response.json({
      ok: true,
      metadata: {
        size: object.size,
        type: object.httpMetadata?.contentType ?? 'application/octet-stream',
        lastModified: object.uploaded.toISOString(),
        version: object.customMetadata?.version ?? '0',
      },
    } satisfies MetadataResponse);
  } catch (err) {
    return Response.json({
      ok: false,
      error: `Metadata fetch failed: ${(err as Error).message}`,
    } satisfies MetadataResponse, { status: 500 });
  }
};
