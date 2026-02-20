import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={!!user} />
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-10">
        {children}
      </main>
      <BottomNav isAuthenticated={!!user} />
    </div>
  );
}
