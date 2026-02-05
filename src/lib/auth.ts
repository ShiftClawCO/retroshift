import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
}

interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('wos-session');
    
    if (!sessionCookie?.value) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.WORKOS_COOKIE_PASSWORD);
    const { payload } = await jwtVerify(sessionCookie.value, secret);
    
    return payload as unknown as Session;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function getUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}
