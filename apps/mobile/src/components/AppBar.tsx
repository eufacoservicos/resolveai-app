import { Text, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  title?: string;
  /** Some quando a tela é raiz de aba, onde não há para onde voltar. */
  showBack?: boolean;
  action?: ReactNode;
}

export function AppBar({ title, showBack = true, action }: Props) {
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const slot = (
    <View style={{ width: 38, height: 38, alignItems: "center", justifyContent: "center" }} />
  );

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing[2],
        height: 56,
        marginTop: insets.top,
        paddingHorizontal: layout.screenPadding,
        backgroundColor: colors.bg,
      }}
    >
      {showBack && router.canGoBack() ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          hitSlop={6}
          style={{
            width: 38,
            height: 38,
            borderRadius: radii.full,
            backgroundColor: colors.surface2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={19} color={colors.textPrimary} />
        </Pressable>
      ) : (
        slot
      )}

      <Text variant="screenTitle" numberOfLines={1} style={{ flex: 1, textAlign: "center" }}>
        {title ?? ""}
      </Text>

      {action ?? slot}
    </View>
  );
}
