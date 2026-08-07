import { Pressable, View } from "react-native";
import { router, type Href } from "expo-router";
import {
  Briefcase,
  Camera,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  HelpCircle,
  ImageIcon,
  LogOut,
  Settings,
  Star,
  Trash2,
  User,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { signOut } from "@resolveai/shared/supabase/mutations";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/ui/avatar";
import { Muted, Text } from "@/components/ui/text";
import { cn } from "@resolveai/shared/cn";

export type ProfileUser = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
};

export type ProfileProviderData = {
  id: string;
  description: string | null;
  city: string;
  whatsapp: string | null;
  is_active: boolean;
  is_verified?: boolean;
  categories: { id: string; name: string; slug: string }[];
  portfolio?: { id: string; image_url: string; created_at: string }[];
  business_hours?: {
    id: string;
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }[];
  average_rating?: number | null;
  review_count?: number;
};

type Props = {
  user: ProfileUser;
  providerProfile: ProfileProviderData | null;
};

function ProfileChecklist({
  user,
  provider,
}: {
  user: ProfileUser;
  provider: ProfileProviderData;
}) {
  const steps: {
    label: string;
    done: boolean;
    href: Href;
    icon: LucideIcon;
  }[] = [
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
      done:
        (provider.business_hours?.length ?? 0) > 0 &&
        provider.business_hours!.some((h) => !h.is_closed),
      href: "/provider/edit",
      icon: Clock,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  if (completedCount === steps.length) return null;

  return (
    <View className="gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-amber-400">
          Complete seu perfil
        </Text>
        <Text className="text-xs font-bold text-amber-400/80">
          {completedCount}/{steps.length}
        </Text>
      </View>

      <View className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <View
          className="h-full rounded-full bg-amber-400"
          style={{ width: `${progress}%` }}
        />
      </View>

      <View className="mt-1 gap-0.5">
        {steps.map((step) => (
          <Pressable
            key={step.label}
            onPress={() => router.push(step.href)}
            className="flex-row items-center gap-3 rounded-xl px-2 py-2 active:bg-white/5"
          >
            {step.done ? (
              <CheckCircle2 size={16} color="#34d399" />
            ) : (
              <Circle size={16} color="#8891a4" />
            )}
            <step.icon size={14} color={step.done ? "#8891a4" : "#f5f7fb"} />
            <Text
              className={cn(
                "text-sm",
                step.done && "text-muted-foreground line-through"
              )}
            >
              {step.label}
            </Text>
            {!step.done && (
              <View className="ml-auto">
                <ChevronRight size={14} color="#8891a4" />
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onPress,
  className,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center justify-between px-4 py-4 active:bg-white/[0.04]",
        className
      )}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          <Icon size={16} color="#8891a4" />
        </View>
        <Text className="text-sm font-semibold">{label}</Text>
      </View>
      <ChevronRight size={16} color="#8891a4" />
    </Pressable>
  );
}

export function ProfileView({ user, providerProfile }: Props) {
  const isProvider = user.role === "PROVIDER" && !!providerProfile;

  async function handleSignOut() {
    await signOut(supabase);
    router.replace("/login");
  }

  return (
    <View className="gap-6">
      {/* Cabeçalho */}
      <View className="items-center gap-3 pt-2">
        <View className="rounded-full border border-white/10 bg-card/60 p-1">
          <Avatar src={user.avatar_url} fallback={user.full_name} size={80} />
        </View>
        <View className="items-center">
          <Text className="text-2xl font-black tracking-tight">
            {user.full_name}
          </Text>
          <Muted className="mt-0.5">{user.email}</Muted>
          <View className="mt-3 flex-row items-center gap-2">
            {isProvider && providerProfile.categories.length > 0 && (
              <View className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1">
                <Text className="text-xs font-bold text-emerald-400">
                  {providerProfile.categories[0].name}
                </Text>
              </View>
            )}
            {isProvider && providerProfile.average_rating != null && (
              <View className="flex-row items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1">
                <Star size={12} color="#fbbf24" fill="#fbbf24" />
                <Text className="text-xs font-bold text-amber-400">
                  {providerProfile.average_rating}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {isProvider && (
        <ProfileChecklist user={user} provider={providerProfile} />
      )}

      {isProvider && (
        <Pressable
          onPress={() => router.push(`/provider/${providerProfile.id}`)}
          className="flex-row items-center gap-4 rounded-2xl border border-primary/25 bg-primary/10 p-4 active:bg-primary/15"
        >
          <View className="h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15">
            <Briefcase size={22} color="#22d3ee" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold">Perfil de prestador</Text>
            <Muted className="mt-0.5 text-xs">
              {providerProfile.review_count ?? 0} avaliações
            </Muted>
          </View>
          <View className="rounded-full bg-primary px-4 py-2">
            <Text className="text-xs font-bold text-primary-foreground">
              Ver perfil
            </Text>
          </View>
        </Pressable>
      )}

      {/* Menu */}
      <View className="overflow-hidden rounded-2xl border border-white/10 bg-card/60">
        <MenuRow
          icon={User}
          label="Editar dados pessoais"
          onPress={() => router.push("/profile/edit")}
        />
        {isProvider && (
          <MenuRow
            icon={Settings}
            label="Editar perfil de prestador"
            onPress={() => router.push("/provider/edit")}
            className="border-t border-white/5"
          />
        )}
        {isProvider && (
          <MenuRow
            icon={ImageIcon}
            label="Gerenciar portfólio"
            onPress={() => router.push("/provider/portfolio")}
            className="border-t border-white/5"
          />
        )}
        <MenuRow
          icon={HelpCircle}
          label="Termos e privacidade"
          onPress={() => router.push("/terms")}
          className="border-t border-white/5"
        />
      </View>

      <Pressable
        onPress={() => router.push("/profile/delete")}
        className="flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-card/60 p-3.5 active:bg-white/[0.04]"
      >
        <Trash2 size={16} color="#8891a4" />
        <Muted className="font-semibold">Excluir conta</Muted>
      </Pressable>

      <Pressable
        onPress={handleSignOut}
        className="flex-row items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 p-3.5 active:bg-destructive/15"
      >
        <LogOut size={16} color="#f43f5e" />
        <Text className="text-sm font-bold text-destructive">
          Sair da conta
        </Text>
      </Pressable>
    </View>
  );
}
