import { Text, fontSize, lineHeight, useTheme } from "@eufaco/design-system/native";
import { Pressable, View } from "react-native";
import { iconForCategory } from "@/lib/category-icons";

interface Props {
  slug: string;
  name: string;
  onPress?: () => void;
}

/**
 * Ladrilho de categoria do Pen: ícone em disco sobre o nome, três por
 * linha. A largura vem do `flex: 1` da linha, não de um valor fixo.
 */
export function CategoryTile({ slug, name, onPress }: Props) {
  const { colors, radii } = useTheme();
  const Icon = iconForCategory(slug);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver profissionais de ${name}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: "center",
        gap: 9,
        paddingVertical: 15,
        paddingHorizontal: 8,
        borderRadius: radii.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: radii.full,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={21} color={colors.primaryStrong} />
      </View>
      <Text
        variant="captionStrong"
        numberOfLines={2}
        style={{ textAlign: "center", lineHeight: fontSize.caption * lineHeight.compact }}
      >
        {name}
      </Text>
    </Pressable>
  );
}
