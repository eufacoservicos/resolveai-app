import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getCategories } from "@/lib/supabase/queries";
import { BecomeProviderForm } from "@/components/providers/become-provider-form";

export default async function BecomeProviderPage() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect("/login");
  }

  // Already a provider — go to edit page
  if (user.role === "PROVIDER") {
    redirect("/provider/edit");
  }

  const categories = await getCategories(supabase);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          Torne-se um prestador
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Preencha seus dados para começar a receber clientes
        </p>
      </div>

      <BecomeProviderForm categories={categories} userId={user.id} />
    </div>
  );
}
