import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getProviderByUserId } from "@/lib/supabase/queries";
import { PortfolioManager } from "@/components/providers/portfolio-manager";

export default async function PortfolioPage() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user || user.role !== "PROVIDER") {
    redirect("/profile");
  }

  const providerProfile = await getProviderByUserId(supabase, user.id);

  if (!providerProfile) {
    redirect("/profile");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gerenciar Portfólio</h1>
      <PortfolioManager
        providerId={providerProfile.id}
        userId={user.id}
        images={providerProfile.portfolio}
      />
    </div>
  );
}
