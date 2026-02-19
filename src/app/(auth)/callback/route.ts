import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  // Handle OAuth errors from Supabase
  const error = searchParams.get("error");
  if (error) {
    const desc =
      searchParams.get("error_description") ?? "Erro na autenticação";
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(desc)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Check if user was just created (Google OAuth first login)
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
          return NextResponse.redirect(`${origin}/complete-profile`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
