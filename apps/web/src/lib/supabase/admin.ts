import { createClient } from "@supabase/supabase-js";

// Admin client that bypasses RLS using the service role key.
// Only use this server-side in admin-protected routes.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
