import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getProviderByUserId } from "@/lib/supabase/queries";
import { ProfileView } from "@/components/auth/profile-view";

export default async function ProfilePage() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect("/login");
  }

  let providerProfile = null;
  if (user.role === "PROVIDER") {
    providerProfile = await getProviderByUserId(supabase, user.id);
  }

  return (
    <ProfileView user={user} providerProfile={providerProfile} />
  );
}
