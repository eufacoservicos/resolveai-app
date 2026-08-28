import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserFavoriteProviders } from "@/lib/supabase/queries";
import { ProviderCard } from "@/components/providers/provider-card";
import { ProviderGrid } from "@/components/providers/provider-grid";
import { Heart } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Favoritos - eufaço!",
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect("/login");
  }

  const providers = await getUserFavoriteProviders(supabase, user.id);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Favoritos</h1>

      {providers.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
            <Heart className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">
            Nenhum favorito ainda
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Explore prestadores e toque no coração para salvar seus favoritos
          </p>
          <Link
            href="/search"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-semibold text-white gradient-bg"
          >
            Buscar prestadores
          </Link>
        </div>
      ) : (
        <ProviderGrid>
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              userId={user.id}
              isFavorited
            />
          ))}
        </ProviderGrid>
      )}
    </div>
  );
}
