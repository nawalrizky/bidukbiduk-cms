import { NextResponse } from 'next/server'

export function middleware() {
  // Temporarily disable middleware to test client-side auth
  return NextResponse.next()
  
  /*
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Get the access token from cookies
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // If user is not authenticated and trying to access a protected route
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
  */
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
