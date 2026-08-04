"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPostHogClient } from "@/lib/posthog-server";

export async function signInAction(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const posthog = getPostHogClient();
  posthog.identify({
    distinctId: data.user.id,
    properties: { email: data.user.email },
  });
  posthog.capture({
    distinctId: data.user.id,
    event: "user_logged_in",
    properties: { method: "email" },
  });
  await posthog.shutdown();

  redirect("/home");
}
