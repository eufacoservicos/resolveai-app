import { Text, useTheme } from "@eufaco/design-system/native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SearchScreen() {
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
      <Text variant="h1">Buscar</Text>
      <Text color="textSecondary">Busque por serviço, categoria ou nome do profissional.</Text>
    </View>
  );
}
