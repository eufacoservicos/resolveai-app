import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const redirectTo = request.nextUrl.clone();
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      // Redirect based on type or custom next parameter
      if (next) {
        redirectTo.pathname = next;
      } else if (type === "recovery") {
        redirectTo.pathname = "/reset-password";
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userRole = user?.user_metadata?.role;

        if (userRole === "PROVIDER") {
          // Check if the provider profile was already populated
          // (by the DB trigger from migration-v7, or by a previous submission)
          const { data: profile } = await supabase
            .from("provider_profiles")
            .select("id, whatsapp")
            .eq("user_id", user!.id)
            .single();

          if (profile && profile.whatsapp) {
            // Profile already populated (by DB trigger or previous submission)
            // Clean up provider_data from metadata if it exists
            if (user?.user_metadata?.provider_data) {
              await supabase.auth.updateUser({ data: { provider_data: null } });
            }
            redirectTo.pathname = "/home";
          } else {
            // Profile not populated - send to complete-profile as fallback
            redirectTo.pathname = "/complete-profile";
          }
          return NextResponse.redirect(redirectTo);
        }

        redirectTo.pathname = "/home";
      }
      return NextResponse.redirect(redirectTo);
    }
  }

  // On error, redirect to login with error message
  redirectTo.pathname = "/login";
  redirectTo.searchParams.set("error", "Link inválido ou expirado. Tente novamente.");
  return NextResponse.redirect(redirectTo);
}
