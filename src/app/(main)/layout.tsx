import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { FloatingIcons } from "@/components/layout/floating-icons";
import { TermsAcceptanceModal } from "@/components/auth/terms-acceptance-modal";
import { CpfRequiredModal } from "@/components/auth/cpf-required-modal";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  // Check if provider needs to fill CPF
  let pendingCpfProfileId: string | null = null;
  if (user && user.role === "PROVIDER") {
    const { data: profile } = await supabase
      .from("provider_profiles")
      .select("id, cpf")
      .eq("user_id", user.id)
      .single();

    if (profile && profile.cpf === "PENDING") {
      pendingCpfProfileId = profile.id;
    }
  }

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <FloatingIcons />
      <Header isAuthenticated={!!user} />
      {user && !user.accepted_terms_at && (
        <TermsAcceptanceModal userId={user.id} />
      )}
      {pendingCpfProfileId && (
        <CpfRequiredModal profileId={pendingCpfProfileId} />
      )}
      <main className="relative mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-10">
        {children}
      </main>
      <BottomNav isAuthenticated={!!user} />
    </div>
  );
}
