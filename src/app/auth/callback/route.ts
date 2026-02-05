import { WorkOS } from '@workos-inc/node';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const clientId = process.env.WORKOS_CLIENT_ID!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    // Exchange code for user info
    const { user, accessToken, refreshToken } = await workos.userManagement.authenticateWithCode({
      clientId,
      code,
    });

    // Create session data
    const sessionData = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePictureUrl: user.profilePictureUrl,
      },
      accessToken,
      refreshToken,
    };

    // Encode session as JWT
    const secret = new TextEncoder().encode(process.env.WORKOS_COOKIE_PASSWORD);
    const jwt = await new SignJWT(sessionData)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('wos-session', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Redirect to my-retros
    return NextResponse.redirect(new URL('/my-retros', request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}
