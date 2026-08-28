import { formatDiscount, type RecommendedProvider } from "@eufaco/shared";
import { Text, useTheme } from "@eufaco/design-system/native";
import { Sparkles, Star, Tag } from "lucide-react-native";
import { Image, Pressable, View } from "react-native";
import { formatRating, initialsOf } from "@/lib/format";

const CARD_WIDTH = 248;
const COVER_HEIGHT = 118;

/**
 * Card do carrossel de recomendados: perfis do plano pago.
 *
 * Mais alto e com foto, para se distinguir da lista comum — é o que
 * justifica a colocação paga aos olhos de quem assina.
 */
export function FeaturedCard({
  item,
  onPress,
}: {
  item: RecommendedProvider;
  onPress?: () => void;
}) {
  const { colors, radii, spacing } = useTheme();
  const { provider, offer, coverUrl } = item;

  const name = provider.user.full_name;
  const category = provider.categories[0]?.name;
  const rating = formatRating(provider.average_rating);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${category ?? "profissional"} em destaque`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View
        style={{
          width: CARD_WIDTH,
          borderRadius: radii.lg,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      >
        <View style={{ height: COVER_HEIGHT, backgroundColor: colors.surface3 }}>
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text variant="h1" color="textMuted">
                {initialsOf(name)}
              </Text>
            </View>
          )}

          {/* Selos sobre a capa, nos dois cantos superiores */}
          <View
            style={{
              position: "absolute",
              top: spacing[2] + 2,
              left: spacing[2] + 2,
              right: spacing[2] + 2,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingVertical: 4,
                paddingHorizontal: 9,
                borderRadius: radii.full,
                backgroundColor: colors.primary,
              }}
            >
              <Sparkles size={10} color={colors.onPrimary} />
              <Text variant="caption" color="onPrimary">
                Destaque
              </Text>
            </View>

            {offer ? (
              <View
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 9,
                  borderRadius: radii.full,
                  backgroundColor: colors.accent,
                }}
              >
                <Text variant="caption" style={{ color: "#FFFFFF" }}>
                  {formatDiscount(offer)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={{ padding: spacing[3], gap: spacing[1] + 1 }}>
          <Text variant="title" numberOfLines={1}>
            {name}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] - 1 }}>
            {category ? (
              <Text variant="label" color="primaryStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
                {category}
              </Text>
            ) : null}
            {rating ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                <Star size={11} color={colors.accent} fill={colors.accent} />
                <Text variant="label">{rating}</Text>
              </View>
            ) : null}
          </View>

          {offer ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing[1] + 1,
                paddingTop: spacing[1],
              }}
            >
              <Tag size={12} color={colors.accent} />
              <Text variant="caption" color="accent" numberOfLines={1} style={{ flex: 1 }}>
                {offer.title}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
