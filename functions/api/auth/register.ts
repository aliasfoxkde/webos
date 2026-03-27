/**
 * Register endpoint - create a new user account.
 */
interface RegisterRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  ok: boolean;
  token?: string;
  user?: { id: string; username: string };
  error?: string;
}

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
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  }));
  const signature = btoa(simpleHash(`${header}.${payload}.${userId}`));
  return `${header}.${payload}.${signature}`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = (await context.request.json()) as RegisterRequest;
  const { username, password } = body;

  if (!username || !password) {
    return Response.json({ ok: false, error: 'Username and password required' } satisfies AuthResponse, { status: 400 });
  }

  if (username.length < 3) {
    return Response.json({ ok: false, error: 'Username must be at least 3 characters' } satisfies AuthResponse, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json({ ok: false, error: 'Password must be at least 6 characters' } satisfies AuthResponse, { status: 400 });
  }

  const userId = `user-${simpleHash(username)}`;

  if (users.has(userId)) {
    return Response.json({ ok: false, error: 'Username already taken' } satisfies AuthResponse, { status: 409 });
  }

  users.set(userId, {
    id: userId,
    username,
    passwordHash: simpleHash(password),
  });

  const token = createToken(userId);

  return Response.json({
    ok: true,
    token,
    user: { id: userId, username },
  } satisfies AuthResponse, { status: 201 });
};
