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
  ShieldCheck,
  CheckCircle2,
  Circle,
  Camera,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    is_verified?: boolean;
    categories: { id: string; name: string; slug: string }[];
    portfolio?: { id: string; image_url: string; created_at: string }[];
    business_hours?: { id: string; day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean }[];
    average_rating?: number | null;
    review_count?: number;
  } | null;
}

function ProfileChecklist({ user, provider }: {
  user: ProfileViewProps["user"];
  provider: NonNullable<ProfileViewProps["providerProfile"]>;
}) {
  const steps = [
    {
      label: "Foto de perfil",
      done: !!user.avatar_url,
      href: "/profile/edit",
      icon: Camera,
    },
    {
      label: "Portfólio de trabalhos",
      done: (provider.portfolio?.length ?? 0) > 0,
      href: "/provider/portfolio",
      icon: ImageIcon,
    },
    {
      label: "Horário de funcionamento",
      done: (provider.business_hours?.length ?? 0) > 0 && provider.business_hours!.some(h => !h.is_closed),
      href: "/provider/edit",
      icon: Clock,
    },
    {
      label: "Verificação de identidade",
      done: !!provider.is_verified,
      href: "/provider/verification",
      icon: ShieldCheck,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  if (completedCount === steps.length) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Complete seu perfil</p>
        <span className="text-xs font-medium text-muted-foreground">
          {completedCount}/{steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-amber-200/50 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-1">
        {steps.map((step) => (
          <Link
            key={step.label}
            href={step.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
              step.done
                ? "text-muted-foreground"
                : "text-foreground hover:bg-amber-100/50"
            )}
          >
            {step.done ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            )}
            <step.icon className={cn("h-3.5 w-3.5 shrink-0", step.done ? "text-muted-foreground" : "text-foreground")} />
            <span className={step.done ? "line-through" : ""}>{step.label}</span>
            {!step.done && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
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

      {/* Profile checklist for providers */}
      {isProvider && (
        <ProfileChecklist user={user} provider={providerProfile} />
      )}

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
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
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

        {isProvider && (
          <Link
            href="/provider/verification"
            className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium">
                Verificar perfil
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
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-card p-3 text-destructive transition-colors hover:bg-destructive/5"
      >
        <LogOut className="h-4 w-4" />
        <span className="text-sm font-semibold">Sair da conta</span>
      </button>
    </div>
  );
}
