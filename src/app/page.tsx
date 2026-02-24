import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/landing/landing-page";

export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // If OAuth redirected here with a code, forward to the callback route
  if (params.code) {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string") qs.set(key, value);
    }
    redirect(`/callback?${qs.toString()}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }

  return <LandingPage />;
}
