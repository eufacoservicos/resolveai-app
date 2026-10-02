import { letterSpacing, nativeFonts, Text, useShadow, useTheme } from "@eufaco/design-system/native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Barra em cápsula flutuante, como no design.
 * O Tabs padrão do React Navigation encosta na borda; aqui a barra
 * fica destacada do fundo e cada item ganha realce próprio.
 */
/**
 * Tipado pelo que a barra realmente consome, e não por BottomTabBarProps:
 * o expo-router e o @react-navigation/bottom-tabs carregam cópias
 * diferentes desses tipos e a atribuição direta não compila.
 */
interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => ReactNode;
      };
    }
  >;
  navigation: {
    emit(event: {
      type: "tabPress";
      target: string;
      canPreventDefault: true;
    }): { defaultPrevented: boolean };
    navigate(name: string): void;
  };
}

/** Altura da cápsula, como no Pen. */
const CAPSULE_HEIGHT = 58;
/** Folga do Pen entre o fim do conteúdo e a cápsula. */
const CONTENT_GAP = 22;

/**
 * Espaço livre que uma tela de aba precisa deixar no fim da rolagem
 * para a barra flutuante não cobrir o último item.
 */
export function useTabBarClearance(): number {
  const insets = useSafeAreaInsets();
  return CONTENT_GAP + CAPSULE_HEIGHT + Math.max(insets.bottom, 12);
}

export function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const { colors, radii, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const lift = useShadow("bar");

  return (
    <View
      style={[
        styles.wrap,
        { paddingBottom: Math.max(insets.bottom, spacing[3]), paddingHorizontal: spacing[4] },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.capsule,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radii.full,
          },
          lift,
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]!;
          const focused = state.index === index;
          const label = options.title ?? route.name;
          const Icon = options.tabBarIcon;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={[
                styles.item,
                {
                  borderRadius: radii.full,
                  backgroundColor: focused ? colors.primarySoft : "transparent",
                },
              ]}
            >
              {Icon?.({
                focused,
                color: focused ? colors.primaryStrong : colors.textMuted,
                size: 21,
              })}
              <Text
                numberOfLines={1}
                color={focused ? "primaryStrong" : "textMuted"}
                variant="micro"
                style={{
                  fontFamily: focused ? nativeFonts.bodyBold : nativeFonts.bodyMedium,
                  letterSpacing: letterSpacing.nudge,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  capsule: {
    flexDirection: "row",
    alignItems: "center",
    height: CAPSULE_HEIGHT,
    padding: 5,
    gap: 2,
    borderWidth: 1,
  },
  item: { flex: 1, height: "100%", alignItems: "center", justifyContent: "center", gap: 3 },
});
