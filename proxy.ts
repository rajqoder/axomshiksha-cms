import { NextRequest, NextResponse } from 'next/server';
import { createClient } from './lib/supabase/server';

import writers from './data/writers.json';

export async function proxy(req: NextRequest) {
  const pathName = req.nextUrl.pathname;

  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if no session
  if (!session) {
    if (pathName.startsWith('/admin') || pathName === '/new-post' || pathName === '/profile' || pathName.startsWith('/posts')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  if (session) {
    // Prevent logged-in users from accessing auth pages
    if (pathName === '/login' || pathName === '/signup') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Admin Route Protection
    if (pathName.startsWith('/admin')) {
      const userEmail = session.user.email;
      const writer = Object.values(writers).find((w: any) => w.email === userEmail) as any;

      if (!writer || writer.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/new-post",
    "/posts",
    "/posts/:path",
    "/profile",
  ],
};