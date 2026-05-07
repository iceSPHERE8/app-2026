import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  const { pathname } = request.nextUrl

  // 1. 如果访问的是 /admin 根路径
  // 我们不在这里重定向，因为登录表单就在这个页面里
  if (pathname === '/admin') {
    return NextResponse.next()
  }

  // 2. 如果访问的是 /admin/ 之后的子路径 (例如 /admin/upload)
  if (pathname.startsWith('/admin/')) {
    // 如果没有 token，强制跳回 /admin 登录
    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}