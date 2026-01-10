import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from './lib/supabase/server';

export async function proxy(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  });

  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define protected routes
  const protectedPaths = [
    '/new-post',
    '/posts/[id]/edit', // This would match /posts/[id]/edit
    '/profile', // Protect the profile page
  ];

  // Check if current path matches protected routes
  const isProtectedPath = protectedPaths.some((path) => {
    // Convert Next.js dynamic route pattern to regex
    const regexPattern = path
      .replace(/\[[^\]]*\]/g, '([^/]+)') // Replace [param] with ([^/]+)
      .replace(/\//g, '\/') // Escape forward slashes
      .replace(/^/, '^') // Add start of string anchor
      .replace(/$/, '$'); // Add end of string anchor
    
    const regex = new RegExp(regexPattern);
    return regex.test(req.nextUrl.pathname);
  });

  // If user is not authenticated and trying to access protected route
  if (isProtectedPath && !session) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If user is logged in and trying to access login/signup pages, redirect to home
  const authPaths = ['/login', '/signup'];
  if (authPaths.includes(req.nextUrl.pathname) && session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};