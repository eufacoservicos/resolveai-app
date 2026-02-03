import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/callback", "/forgot-password", "/reset-password"];
  const sharedRoutes = ["/terms", "/privacy"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isSharedRoute = sharedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Shared routes (termos, privacidade) are accessible by anyone
  if (isSharedRoute) {
    return supabaseResponse;
  }

  // Landing page (/) is accessible by anyone
  if (pathname === "/") {
    return supabaseResponse;
  }

  // If user is not authenticated and trying to access a protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access auth routes, redirect to home
  if (user && isPublicRoute && pathname !== "/callback") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
