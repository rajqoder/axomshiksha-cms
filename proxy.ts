import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from './lib/supabase/server';

export async function proxy(req: NextRequest) {
  const pathName = req.nextUrl.pathname;

  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if(!session) return NextResponse.redirect(new URL('/login', req.url));

  if(session){
    if(pathName == 'login' || pathName == 'signup'){
      return NextResponse.next();
    }
  }
}

export const config = {
  matcher: [
    "/new-post",
    "/posts",
    "/posts/:path",
    "/profile",
  ],
};