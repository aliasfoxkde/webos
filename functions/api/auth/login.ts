/**
 * Login endpoint - simple token-based auth.
 * Returns a JWT-like token for client storage.
 */
interface LoginRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  ok: boolean;
  token?: string;
  user?: { id: string; username: string };
  error?: string;
}

// In-memory user store (would be D1 in production)
const users = new Map<string, { id: string; username: string; passwordHash: string }>();

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

function createToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  }));
  const signature = btoa(simpleHash(`${header}.${payload}.${userId}`));
  return `${header}.${payload}.${signature}`;
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
  const body = (await context.request.json()) as LoginRequest;
  const { username, password } = body;

  if (!username || !password) {
    return Response.json({ ok: false, error: 'Username and password required' } satisfies AuthResponse, { status: 400 });
  }

  // Check for existing user
  const userId = `user-${simpleHash(username)}`;
  const existing = users.get(userId);

  if (existing && existing.passwordHash !== simpleHash(password)) {
    return Response.json({ ok: false, error: 'Invalid password' } satisfies AuthResponse, { status: 401 });
  }

  // Create user if not exists
  if (!existing) {
    users.set(userId, {
      id: userId,
      username,
      passwordHash: simpleHash(password),
    });
  }

  const token = createToken(userId);

  return Response.json({
    ok: true,
    token,
    user: { id: userId, username },
  } satisfies AuthResponse);
};
