import { NextResponse, type NextRequest } from 'next/server';

// без refresh-cookie користувач точно не увійшов: одразу ведемо на вхід,
// ще до того, як сторінка почне рендеритись
export function proxy(request: NextRequest) {
  if (!request.cookies.has('refreshToken')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

// на яких сторінках це перевіряти
export const config = {
  matcher: ['/profile/:path*'],
};