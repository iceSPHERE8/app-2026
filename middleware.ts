// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  const isLoginPage = request.nextUrl.pathname === '/admin'

  // 如果访问的是管理页面且没有 token，可以根据需求在这里做逻辑
  // 比如：非 admin 页面如果需要保护，可以强制重定向
  
  return NextResponse.next()
}

// 匹配路径：仅在 admin 目录下运行中间件
export const config = {
  matcher: '/admin/:path*',
}