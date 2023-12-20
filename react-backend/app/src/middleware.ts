import { NextRequest, NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";

export async  function middleware(req: NextRequest) {
  const secret_key = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret: secret_key });
  if(token && !req.nextUrl.pathname.startsWith('/admin'))
    return NextResponse.redirect(new URL('/admin/news', req.url));
  else if ((!secret_key || !token) && !req.nextUrl.pathname.startsWith('/admin/login')) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}
export const config = { matcher: ["/","/news","/article","/download","/feedback","/about","/expert","/admin/:path*"] }
