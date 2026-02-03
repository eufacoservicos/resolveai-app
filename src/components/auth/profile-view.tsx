"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/mutations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  User,
  Settings,
  HelpCircle,
  ChevronRight,
  Star,
  Briefcase,
  ImageIcon,
} from "lucide-react";

interface ProfileViewProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role: string;
  };
  providerProfile: {
    id: string;
    description: string;
    city: string;
    whatsapp: string;
    is_active: boolean;
    categories: { id: string; name: string; slug: string }[];
    average_rating?: number | null;
    review_count?: number;
  } | null;
}

export function ProfileView({ user, providerProfile }: ProfileViewProps) {
  const router = useRouter();
  const supabase = createClient();

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    await signOut(supabase);
    router.push("/login");
    router.refresh();
  }

  const isProvider = user.role === "PROVIDER" && providerProfile;

  return (
    <div className="space-y-5">
      {/* User info header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{user.full_name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-1.5 flex items-center gap-2">
            {isProvider && providerProfile.categories.length > 0 && (
              <Badge className="rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium border-0 hover:bg-emerald-100">
                {providerProfile.categories[0].name}
              </Badge>
            )}
            {isProvider &&
              providerProfile.average_rating !== undefined &&
              providerProfile.average_rating !== null && (
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">
                    {providerProfile.average_rating}
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Provider profile card */}
      {isProvider && (
        <Link href={`/provider/${providerProfile.id}`} className="block">
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Perfil de prestador</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {providerProfile.review_count ?? 0} avaliações
              </p>
            </div>
            <div className="rounded-lg bg-primary px-4 py-2">
              <span className="text-sm font-semibold text-white">
                Ver perfil
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Menu items */}
      <div className="rounded-xl border border-border bg-white divide-y divide-border">
        <Link
          href="/profile/edit"
          className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">Editar dados pessoais</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        {isProvider && (
          <Link
            href="/provider/edit"
            className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">
                Editar perfil de prestador
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        )}

        {isProvider && (
          <Link
            href="/provider/portfolio"
            className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">
                Gerenciar portfólio
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        )}

        <Link
          href="/terms"
          className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">Termos e privacidade</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-white p-3 text-destructive transition-colors hover:bg-destructive/5"
      >
        <LogOut className="h-4 w-4" />
        <span className="text-sm font-semibold">Sair da conta</span>
      </button>
    </div>
  );
}
