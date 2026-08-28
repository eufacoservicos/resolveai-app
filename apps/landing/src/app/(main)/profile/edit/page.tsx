import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";
import { UserProfileForm } from "@/components/auth/user-profile-form";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar Dados Pessoais</h1>
      <UserProfileForm user={user} />
    </div>
  );
}
