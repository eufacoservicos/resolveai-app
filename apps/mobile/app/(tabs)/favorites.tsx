import { Text, useTheme } from "@eufaco/design-system/native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FavoritesScreen() {
  const { colors, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: insets.top + spacing[4],
        paddingHorizontal: layout.screenPadding,
        gap: spacing[2],
      }}
    >
      <Text variant="h1">Favoritos</Text>
      <Text color="textSecondary">Os profissionais que você salvou para depois.</Text>
    </View>
  );
}
