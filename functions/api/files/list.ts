/**
 * List files endpoint - list files in R2 under a user prefix.
 */
import { verifyToken } from '../auth/login';

interface ListResponse {
  ok: boolean;
  files?: Array<{ key: string; size: number; lastModified: string; type: string }>;
  error?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const token = context.request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return Response.json({ ok: false, error: 'Unauthorized' } satisfies ListResponse, { status: 401 });
  }

  const userId = verifyToken(token);
  if (!userId) {
    return Response.json({ ok: false, error: 'Invalid token' } satisfies ListResponse, { status: 401 });
  }

  const prefix = context.env.FILES ? `${userId}/` : `${userId}/`;
  const url = new URL(context.request.url);
  const folderPrefix = url.searchParams.get('prefix') ?? '';

  try {
    const listed = await context.env.FILES.list({
      prefix: `${prefix}${folderPrefix}`,
      limit: 1000,
    });

    const files = listed.objects.map((obj) => ({
      key: obj.key.replace(`${prefix}`, ''),
      size: obj.size,
      lastModified: obj.uploaded.toISOString(),
      type: obj.key.endsWith('/') ? 'folder' : 'file',
    }));

    return Response.json({ ok: true, files } satisfies ListResponse);
  } catch (err) {
    return Response.json({
      ok: false,
      error: `Failed to list files: ${(err as Error).message}`,
    } satisfies ListResponse, { status: 500 });
  }
};
