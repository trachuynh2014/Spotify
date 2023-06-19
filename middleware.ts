import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

// Middleware function that handles authentication using Supabase
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client instance using auth-helpers-nextjs
  const supabase = createMiddlewareClient({
    req,
    res,
  });

  // Retrieve the session from Supabase
  await supabase.auth.getSession();

  // Return the response
  return res;
}
