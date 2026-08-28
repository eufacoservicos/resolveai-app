import { redirect } from "next/navigation";
import { ProviderLandingPage } from "@/components/landing/provider-landing-page";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";

type CopyVariant = "a" | "b";

function getVariant(value: string | string[] | undefined): CopyVariant {
  if (Array.isArray(value)) {
    return value[0] === "b" ? "b" : "a";
  }

  return value === "b" ? "b" : "a";
}

export default async function ProvidersLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (user?.role === "PROVIDER") {
    redirect("/provider/edit");
  }

  if (user?.role === "CLIENT") {
    redirect("/become-provider");
  }

  return (
    <ProviderLandingPage
      headlineVariant={getVariant(params.h)}
      ctaVariant={getVariant(params.cta)}
    />
  );
}
