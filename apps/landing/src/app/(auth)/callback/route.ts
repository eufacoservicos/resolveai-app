import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  // Use x-forwarded-host in production (Vercel/reverse proxy)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const redirectOrigin =
    isLocalEnv || !forwardedHost ? origin : `https://${forwardedHost}`;

  // Handle OAuth errors from Supabase
  const error = searchParams.get("error");
  if (error) {
    const desc =
      searchParams.get("error_description") ?? "Erro na autenticação";
    return NextResponse.redirect(
      `${redirectOrigin}/login?error=${encodeURIComponent(desc)}`
    );
  }

  if (code) {
    const cookieStore = await cookies();

    // Collect cookies to explicitly set on the redirect response
    const cookiesToSet: Array<{
      name: string;
      value: string;
      options: Record<string, unknown>;
    }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookies) {
            cookies.forEach(({ name, value, options }) => {
              cookiesToSet.push({ name, value, options });
              try {
                cookieStore.set(name, value, options);
              } catch {
                // May fail in certain contexts — cookies will be set on the response below
              }
            });
          },
        },
      }
    );

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Check if user was just created (Google OAuth first login)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let redirectPath = next;

      if (user) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id, role")
          .eq("id", user.id)
          .single();

        // If user exists and was created via Google (no role metadata set),
        // check if created_at is very recent (within last 30 seconds) = new user
        const isNewUser =
          existingUser &&
          new Date().getTime() - new Date(user.created_at).getTime() < 30000;

        if (isNewUser) {
          redirectPath = "/complete-profile";
        }
      }

      const response = NextResponse.redirect(
        `${redirectOrigin}${redirectPath}`
      );

      // Explicitly set session cookies on the redirect response
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });

      return response;
    }

    // Exchange failed — redirect with error message
    return NextResponse.redirect(
      `${redirectOrigin}/login?error=${encodeURIComponent("Erro ao autenticar com Google. Tente novamente.")}`
    );
  }

  return NextResponse.redirect(`${redirectOrigin}/login`);
}
