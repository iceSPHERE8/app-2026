// middleware.ts 放在根目录
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  const { pathname } = request.nextUrl

  // 1. 定义登录页路径
  const loginPage = '/admin' // 假设这是你的登录页面

  // 2. 逻辑：如果用户正在访问 /admin/*（除了登录页本身）
  if (pathname.startsWith('/admin') && pathname !== loginPage) {
    // 3. 如果没有 token，直接重定向回登录页
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = loginPage
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// 匹配路径：拦截所有以 /admin 开头的请求
export const config = {
  matcher: '/admin/:path*',
}