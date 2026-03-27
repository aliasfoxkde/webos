/**
 * Upload file endpoint - upload a file to R2.
 */
import { verifyToken } from '../auth/login';

interface UploadResponse {
  ok: boolean;
  key?: string;
  error?: string;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const token = context.request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return Response.json({ ok: false, error: 'Unauthorized' } satisfies UploadResponse, { status: 401 });
  }

  const userId = verifyToken(token);
  if (!userId) {
    return Response.json({ ok: false, error: 'Invalid token' } satisfies UploadResponse, { status: 401 });
  }

  const url = new URL(context.request.url);
  const filePath = url.searchParams.get('path');
  if (!filePath) {
    return Response.json({ ok: false, error: 'Missing path parameter' } satisfies UploadResponse, { status: 400 });
  }

  // Normalize path
  const cleanPath = filePath.replace(/^\/+|\/+$/g, '');
  const key = `${userId}/${cleanPath}`;

  try {
    const body = await context.request.arrayBuffer();
    await context.env.FILES.put(key, body, {
      httpMetadata: {
        contentType: context.request.headers.get('Content-Type') ?? 'application/octet-stream',
      },
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        version: '1',
      },
    });

    return Response.json({ ok: true, key } satisfies UploadResponse);
  } catch (err) {
    return Response.json({
      ok: false,
      error: `Upload failed: ${(err as Error).message}`,
    } satisfies UploadResponse, { status: 500 });
  }
};
