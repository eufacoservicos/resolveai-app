import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import type { GestureResponderEvent, StyleProp, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Search, Heart, User } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@resolveai/shared/supabase/queries";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";
import { TermsAcceptanceModal } from "@/components/auth/terms-acceptance-modal";
import { CpfRequiredModal } from "@/components/auth/cpf-required-modal";
import { Text } from "@/components/ui/text";

const TAB_INNER_HEIGHT = 64;
const TAB_MARGIN = 12;
const TAB_HORIZONTAL_MARGIN = 16;

async function fetchPendingCpfProfileId(userId: string) {
  const { data: profile } = await supabase
    .from("provider_profiles")
    .select("id, cpf")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) return null;

  const rawDocument = profile.cpf?.replace(/\D/g, "") ?? "";
  const hasValidDocumentLength =
    rawDocument.length === 11 || rawDocument.length === 14;
  const isPlaceholder = (profile.cpf ?? "").toUpperCase().startsWith("PENDING");

  return isPlaceholder || !hasValidDocumentLength ? (profile.id as string) : null;
}

// ─── Custom tab button (pill quando ativo) ─────────────────────────
type TabButtonProps = {
  accessibilityState?: { selected?: boolean };
  onPress?: ((e: GestureResponderEvent) => void) | null;
  onLongPress?: ((e: GestureResponderEvent) => void) | null;
  style?: StyleProp<ViewStyle>;
};

function makeTabButton(icon: LucideIcon, label: string) {
  return function TabButton({
    accessibilityState,
    onPress,
    onLongPress,
    style,
  }: TabButtonProps) {
    const focused = accessibilityState?.selected ?? false;
    return (
      <Pressable
        onPress={onPress ?? undefined}
        onLongPress={onLongPress ?? undefined}
        style={style}
        className="flex-1 items-center justify-center"
      >
        <View className="items-center justify-center gap-1">
          <View
            className={
              focused
                ? "h-9 w-14 items-center justify-center overflow-hidden rounded-full"
                : "h-9 w-9 items-center justify-center"
            }
          >
            {focused && (
              <LinearGradient
                colors={["rgba(34,211,238,0.22)", "rgba(99,102,241,0.20)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
            )}
            {(() => {
              const Icon = icon;
              return (
                <Icon
                  size={22}
                  color={focused ? "#22d3ee" : "#8891a4"}
                  strokeWidth={focused ? 2.4 : 2}
                />
              );
            })()}
          </View>
          <Text
            className={
              focused
                ? "text-[10px] font-bold text-primary"
                : "text-[10px] font-semibold text-muted-foreground"
            }
          >
            {label}
          </Text>
        </View>
      </Pressable>
    );
  };
}

const HomeButton = makeTabButton(Home, "Início");
const SearchButton = makeTabButton(Search, "Buscar");
const FavoritesButton = makeTabButton(Heart, "Favoritos");
const ProfileButton = makeTabButton(User, "Perfil");

export default function MainLayout() {
  const { loading, session, user: authUser } = useAuth();
  const insets = useSafeAreaInsets();

  const currentUserQuery = useQuery({
    queryKey: ["current-user", authUser?.id],
    queryFn: () => getCurrentUser(supabase),
    enabled: !!authUser,
  });

  const pendingCpfQuery = useQuery({
    queryKey: ["pending-cpf", authUser?.id],
    queryFn: () => fetchPendingCpfProfileId(authUser!.id),
    enabled: !!authUser,
  });

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  const currentUser = currentUserQuery.data as
    | { id: string; accepted_terms_at: string | null }
    | undefined;

  const needsTerms = !!currentUser && !currentUser.accepted_terms_at;
  const pendingCpfProfileId = pendingCpfQuery.data ?? null;

  const bottomOffset = Math.max(insets.bottom, 12);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            left: TAB_HORIZONTAL_MARGIN,
            right: TAB_HORIZONTAL_MARGIN,
            bottom: bottomOffset,
            height: TAB_INNER_HEIGHT,
            borderRadius: 999,
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            backgroundColor:
              Platform.OS === "android" ? "rgba(15,17,22,0.92)" : "transparent",
            elevation: 12,
            shadowColor: "#000",
            shadowOpacity: 0.4,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 12 },
            paddingHorizontal: 8,
          },
          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <BlurView
                tint="dark"
                intensity={80}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 999,
                  overflow: "hidden",
                  backgroundColor: "rgba(15,17,22,0.55)",
                }}
              />
            ) : null,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{ title: "Início", tabBarButton: HomeButton }}
        />
        <Tabs.Screen
          name="search"
          options={{ title: "Buscar", tabBarButton: SearchButton }}
        />
        <Tabs.Screen
          name="favorites"
          options={{ title: "Favoritos", tabBarButton: FavoritesButton }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{ title: "Perfil", tabBarButton: ProfileButton }}
        />

        {/* Rotas alcancadas por navegacao, fora da barra de abas. */}
        <Tabs.Screen name="categories" options={{ href: null }} />
        <Tabs.Screen name="become-provider" options={{ href: null }} />
        <Tabs.Screen name="terms" options={{ href: null }} />
        <Tabs.Screen name="privacy" options={{ href: null }} />
        <Tabs.Screen name="profile/edit" options={{ href: null }} />
        <Tabs.Screen name="profile/delete" options={{ href: null }} />
        <Tabs.Screen name="provider/[id]/index" options={{ href: null }} />
        <Tabs.Screen name="provider/[id]/review" options={{ href: null }} />
        <Tabs.Screen name="provider/edit" options={{ href: null }} />
        <Tabs.Screen name="provider/portfolio" options={{ href: null }} />
      </Tabs>

      {needsTerms && <TermsAcceptanceModal userId={currentUser.id} />}
      {pendingCpfProfileId && (
        <CpfRequiredModal profileId={pendingCpfProfileId} />
      )}
    </>
  );
}
