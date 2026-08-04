import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getProviderByUserId, getCategories } from "@/lib/supabase/queries";
import { ProviderProfileForm } from "@/components/providers/provider-profile-form";
import { BusinessHoursEditor } from "@/components/providers/business-hours-editor";

export default async function EditProviderPage() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user || user.role !== "PROVIDER") {
    redirect("/profile");
  }

  const [providerProfile, categories] = await Promise.all([
    getProviderByUserId(supabase, user.id),
    getCategories(supabase),
  ]);

  if (!providerProfile) {
    redirect("/profile");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar Perfil de Prestador</h1>
      <ProviderProfileForm
        profile={providerProfile}
        categories={categories}
        userId={user.id}
      />
      <BusinessHoursEditor
        providerId={providerProfile.id}
        initialHours={providerProfile.business_hours ?? []}
      />
    </div>
  );
}
