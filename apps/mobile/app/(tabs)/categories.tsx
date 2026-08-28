import { Text, useTheme } from "@eufaco/design-system/native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CategoriesScreen() {
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
      <Text variant="h1">Categorias</Text>
      <Text color="textSecondary">Mais de 80 tipos de profissionais, agrupados por área.</Text>
    </View>
  );
}
