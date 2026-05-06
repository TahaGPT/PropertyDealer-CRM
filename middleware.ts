import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Simple in-memory rate limit (not suitable for multi-instance production, but fits assignment)
const rateLimitMap = new Map();

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();

    // Rate Limiting Logic
    if (path.startsWith('/api')) {
      const userLimit = token?.role === 'ADMIN' ? 1000 : 50; // Admins higher, Agents 50/min
      const userData = rateLimitMap.get(ip) || { count: 0, startTime: now };

      if (now - userData.startTime > 60000) {
        userData.count = 1;
        userData.startTime = now;
      } else {
        userData.count++;
      }
      rateLimitMap.set(ip, userData);

      if (userData.count > userLimit) {
        return new NextResponse('Too Many Requests', { status: 429 });
      }
    }

    // Admin-only routes
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/leads', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/leads/:path*',
    '/settings/:path*',
    '/api/:path*',
  ],
};
