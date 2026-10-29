import { NextRequest, NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";

// 不用登入的後台 API：taicol.tw 前台的文章／消息／下載／FAQ 列表目前直接讀分類（GET /api/admin/category?type=…）。
// 前台改用 /api/category（內容相同）並部署後，就可以把這個例外拿掉（陣列改成空的）。
const PUBLIC_ADMIN_API = ['/api/admin/category'];

export async  function middleware(req: NextRequest) {
  const secret_key = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret: secret_key });
  const { pathname } = req.nextUrl;

  // 後台 API：未登入一律 401（原本 matcher 沒涵蓋 /api，未登入也能上傳、新增或刪除資料）
  if (pathname.startsWith('/api/admin')) {
    if (req.method === 'GET' && PUBLIC_ADMIN_API.includes(pathname)) return NextResponse.next();
    if (!secret_key || !token) return NextResponse.rewrite(new URL('/api/unauthorized', req.url));
    return NextResponse.next();
  }

  if(token && !req.nextUrl.pathname.startsWith('/admin'))
    return NextResponse.redirect(new URL('/admin/news', req.url));
  else if ((!secret_key || !token) && !req.nextUrl.pathname.startsWith('/admin/login')) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
}
export const config = { matcher: ["/","/news","/article","/download","/feedback","/register_taxon","/about","/expert","/admin/:path*","/api/admin/:path*"] }
