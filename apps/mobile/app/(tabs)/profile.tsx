import { getCurrentUser, getProviderStats, type ProviderStats, type User } from "@eufaco/shared";
import {
  Text,
  fontSize,
  letterSpacing,
  lineHeight,
  nativeFonts,
  useTheme,
} from "@eufaco/design-system/native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Bell,
  Briefcase,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Image as ImageIcon,
  Share2,
  Sparkles,
  SquarePen,
  Tag,
  LogOut,
  MessageCircle,
  Moon,
  Star,
  SunMedium,
  Trash2,
  UserRound,
} from "lucide-react-native";
import type { ComponentType } from "react";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Share, View } from "react-native";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ListRow } from "@/components/ListRow";
import { SectionHeader } from "@/components/SectionHeader";
import { SignInPrompt } from "@/components/SignInPrompt";
import { StatCard } from "@/components/StatCard";
import { AppBar } from "@/components/AppBar";
import { useTabBarClearance } from "@/components/TabBar";
import { useProviderAccount } from "@/hooks/useProviderAccount";
import { formatRating, initialsOf } from "@/lib/format";
import { useSession } from "@/lib/session";
import { useThemePreference } from "@/lib/theme-preference";
import { supabase } from "@/lib/supabase";

interface Row {
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  danger?: boolean;
  badge?: string;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();
  const { session, loading: sessionLoading, signOut } = useSession();
  const { provider, usage } = useProviderAccount();
  const tabBarClearance = useTabBarClearance();
  const { scheme, toggle: toggleTheme } = useThemePreference();

  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = session?.user.id;
  const providerId = provider?.id;

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        setLoading(false);
        return;
      }
      let active = true;
      setLoading(true);
      getCurrentUser(supabase)
        .then((result) => {
          if (active) setUser(result as User | null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [userId]),
  );

  // Números do painel: só existem para quem tem perfil profissional
  useFocusEffect(
    useCallback(() => {
      if (!providerId) {
        setStats(null);
        return;
      }
      let active = true;
      void getProviderStats(supabase, providerId).then((result) => {
        if (active) setStats(result);
      });
      return () => {
        active = false;
      };
    }, [providerId]),
  );

  const [signOutOpen, setSignOutOpen] = useState(false);

  if (sessionLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingBottom: tabBarClearance }}>
        <SignInPrompt
          title="Sua conta no eufaço!"
          description="Entre para salvar favoritos, avaliar quem te atendeu e oferecer seus próprios serviços."
        />
      </View>
    );
  }

  const fullName = user?.full_name ?? "Sua conta";

  const businessRows: Row[] = [
    { label: "Perfil profissional", icon: Briefcase, onPress: () => router.push("/provider-profile") },
    { label: "Portfólio", icon: ImageIcon, onPress: () => router.push("/portfolio") },
    { label: "Horários de atendimento", icon: Clock3, onPress: () => router.push("/business-hours") },
    { label: "Avaliações recebidas", icon: Star, onPress: () => router.push("/reviews") },
    { label: "Ofertas e descontos", icon: Tag, onPress: () => router.push("/offers") },
    {
      label: "Meu plano",
      icon: Sparkles,
      badge: usage?.plan === "pro" ? "Profissional" : "Grátis",
      onPress: () => router.push(usage?.plan === "pro" ? "/subscription" : "/plans"),
    },
  ];

  const accountRows: Row[] = [
    { label: "Meus contatos", icon: MessageCircle, onPress: () => router.push("/contacts") },
    { label: "Dados pessoais", icon: UserRound, onPress: () => router.push("/profile/edit") },
    { label: "Notificações", icon: Bell, onPress: () => router.push("/notifications/settings") },
    { label: "Termos e privacidade", icon: FileText },
    { label: "Sair da conta", icon: LogOut, danger: true, onPress: () => setSignOutOpen(true) },
    {
      label: "Excluir minha conta",
      icon: Trash2,
      danger: true,
      onPress: () => router.push("/profile/delete"),
    },
  ];

  const shareProfile = () => {
    if (!provider) return;
    void Share.share({
      message: `Veja meu perfil no eufaço! https://eufaco.com.br/provider/${provider.id}`,
    });
  };

  /** Pílula de ação sob o nome, como no cartão de perfil do Pen. */
  const pill = (
    label: string,
    icon: React.ReactNode,
    primary: boolean,
    onPress: () => void,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: radii.full,
        backgroundColor: primary ? colors.primary : colors.surface2,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {icon}
      <Text variant="label" color={primary ? "onPrimary" : "textSecondary"}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppBar
        title="Perfil"
        showBack={false}
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={scheme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
            onPress={toggleTheme}
            style={{
              width: 38,
              height: 38,
              borderRadius: radii.full,
              backgroundColor: colors.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {scheme === "dark" ? (
              <SunMedium size={19} color={colors.textPrimary} />
            ) : (
              <Moon size={19} color={colors.textPrimary} />
            )}
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingTop: 18,
          paddingBottom: tabBarClearance,
          gap: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cartão de identidade */}
        <View
          style={{
            alignItems: "center",
            gap: 12,
            paddingVertical: 22,
            paddingHorizontal: spacing[4],
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 74,
              height: 74,
              borderRadius: 22,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryStrong} />
            ) : (
              <Text
                variant="h1"
                color="primaryStrong"
                style={{ lineHeight: fontSize["3xl"] * lineHeight.tight }}
              >
                {initialsOf(user?.full_name ?? session.user.email ?? "?")}
              </Text>
            )}
          </View>

          <View style={{ alignItems: "center", gap: 3 }}>
            <Text
              variant="h2"
              style={{ textAlign: "center", lineHeight: fontSize.xl * lineHeight.tight }}
            >
              {fullName}
            </Text>
            <Text variant="label" color="textMuted" style={{ fontFamily: nativeFonts.bodyRegular }}>
              {user?.email ?? session.user.email}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {pill(
              "Editar perfil",
              <SquarePen size={14} color={colors.onPrimary} />,
              true,
              () => router.push("/profile/edit"),
            )}
            {provider
              ? pill(
                  "Compartilhar",
                  <Share2 size={14} color={colors.textSecondary} />,
                  false,
                  shareProfile,
                )
              : null}
          </View>
        </View>

        {!provider ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Criar perfil profissional"
            onPress={() => router.push("/become-provider")}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 14,
              borderRadius: radii.lg,
              backgroundColor: colors.primarySoft,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Briefcase size={20} color={colors.primaryStrong} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                variant="title"
                style={{ fontSize: fontSize.base, letterSpacing: letterSpacing.subtle }}
              >
                Quer oferecer seus serviços?
              </Text>
              <Text
                color="textSecondary"
                style={{ fontSize: fontSize.note, lineHeight: fontSize.note * lineHeight.snug }}
              >
                Crie seu perfil profissional e receba clientes
              </Text>
            </View>
            <ChevronRight size={18} color={colors.primaryStrong} />
          </Pressable>
        ) : null}

        {provider ? (
          <View style={{ gap: 10 }}>
            <SectionHeader
              title="Meu negócio"
              actionLabel="Ver todos"
              onAction={() => router.push("/provider-profile")}
            />

            {/* Cota: só faz sentido no plano grátis, onde existe teto */}
            {usage && usage.quota !== null ? (
              <View
                style={{
                  gap: 11,
                  padding: 14,
                  borderRadius: radii.lg,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: usage.exhausted ? colors.danger : colors.accent,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="titleSm" style={{ letterSpacing: letterSpacing.subtle }}>
                      Orçamentos recebidos
                    </Text>
                    <Text variant="caption" color="textMuted">
                      Plano Grátis · renova todo mês
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 1 }}>
                    <Text
                      variant="h2"
                      color={usage.exhausted ? "danger" : "accent"}
                      style={{ fontSize: 20, letterSpacing: letterSpacing.tight }}
                    >
                      {usage.used}
                    </Text>
                    <Text
                      variant="titleSm"
                      color="textMuted"
                      style={{ fontSize: fontSize.chip, paddingBottom: 2 }}
                    >
                      /{usage.quota}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.surface3,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: usage.exhausted ? colors.danger : colors.accent,
                      width: `${Math.min(100, (usage.used / usage.quota) * 100)}%`,
                    }}
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(usage.exhausted ? "/quota-reached" : "/plans")}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Sparkles size={13} color={colors.primaryStrong} />
                  <Text
                    variant="captionStrong"
                    color="primaryStrong"
                    style={{ flex: 1, lineHeight: fontSize.caption * lineHeight.snug }}
                  >
                    {usage.exhausted
                      ? "Você atingiu o limite. Assine para voltar a receber orçamentos."
                      : "Assine o Profissional e receba orçamentos ilimitados"}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <StatCard
                icon={Eye}
                value={stats ? stats.totalViews.toLocaleString("pt-BR") : "—"}
                label="Visualizações"
              />
              <StatCard
                icon={MessageCircle}
                value={stats ? stats.totalClicks.toLocaleString("pt-BR") : "—"}
                label="Contatos"
              />
              <StatCard
                icon={Star}
                value={formatRating(provider.average_rating) ?? "—"}
                label="Nota média"
              />
            </View>

            <View style={{ gap: 8 }}>
              {businessRows.map((row) => (
                <ListRow key={row.label} {...row} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={{ gap: 10 }}>
          <SectionHeader title="Conta" />
          <View style={{ gap: 8 }}>
            {accountRows.map((row) => (
              <ListRow key={row.label} {...row} />
            ))}
          </View>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={signOutOpen}
        icon={LogOut}
        title="Sair da conta?"
        body="Você vai precisar entrar de novo para ver seus favoritos e avaliar quem te atendeu."
        confirmLabel="Sair da conta"
        cancelLabel="Continuar conectado"
        destructive
        onConfirm={() => {
          setSignOutOpen(false);
          void signOut();
        }}
        onCancel={() => setSignOutOpen(false)}
      />
    </View>
  );
}
