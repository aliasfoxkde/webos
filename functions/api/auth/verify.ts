/**
 * Verify token endpoint - check if a token is valid.
 */
interface VerifyResponse {
  ok: boolean;
  valid: boolean;
  userId?: string;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

function verifyToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Date.now()) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export { verifyToken };

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { token } = (await context.request.json()) as { token?: string };

  if (!token) {
    return Response.json({ ok: true, valid: false } satisfies VerifyResponse);
  }

  const userId = verifyToken(token);

  return Response.json({
    ok: true,
    valid: userId !== null,
    userId: userId ?? undefined,
  } satisfies VerifyResponse);
};
