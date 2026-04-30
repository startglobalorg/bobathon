import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'apartner_uid';

export function middleware(request: NextRequest) {
  const uid = request.cookies.get(COOKIE_NAME)?.value ?? crypto.randomUUID();

  // Forward uid as a request header so server components and route handlers
  // can read it via headers() on the very first request (before the browser
  // has sent the cookie back).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-apartner-uid', uid);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (!request.cookies.get(COOKIE_NAME)) {
    response.cookies.set(COOKIE_NAME, uid, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
