import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/register') {
    const url = new URL('/redirected', request.url)
    return NextResponse.redirect('/401');
  }

  return NextResponse.next();
}
