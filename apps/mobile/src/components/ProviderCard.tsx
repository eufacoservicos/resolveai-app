import { isProviderOpenNow, type ProviderWithDetails } from "@eufaco/shared";
import { Badge, Card, Text, useTheme } from "@eufaco/design-system/native";
import { Heart, MapPin, Star } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { formatDistance, formatRating, initialsOf } from "@/lib/format";

interface Props {
  provider: ProviderWithDetails;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  favorited?: boolean;
  /** Selo de desconto, quando o profissional tem oferta vigente. */
  discountLabel?: string | null;
}

export function ProviderCard({
  provider,
  onPress,
  onToggleFavorite,
  favorited = false,
  discountLabel = null,
}: Props) {
  const { colors, radii, spacing } = useTheme();

  const name = provider.user.full_name;
  const isCompany = provider.provider_type === "company";
  const category = provider.categories[0]?.name;
  const rating = formatRating(provider.average_rating);
  const distance = formatDistance(provider.distance_km);
  const { isOpen } = isProviderOpenNow(provider.business_hours);

  return (
    // O card não é um Pressable envolvendo tudo: o coração ficaria como
    // botão dentro de botão, que gera HTML inválido na web e toque
    // ambíguo no nativo. O alvo de toque é só a área de conteúdo.
    <Card style={{ flexDirection: "row", gap: spacing[3], alignItems: "flex-start" }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          rating
            ? `${name}, ${category ?? "profissional"}, nota ${rating}`
            : `${name}, ${category ?? "profissional"}`
        }
        onPress={onPress}
        style={({ pressed }) => ({
          flex: 1,
          flexDirection: "row",
          gap: spacing[3],
          alignItems: "flex-start",
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 16,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text variant="h2" color="primaryStrong">
            {initialsOf(name)}
          </Text>
        </View>

        <View style={{ flex: 1, gap: spacing[1] + 1, paddingTop: 3 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] - 2 }}>
            <Text variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>
              {name}
            </Text>
            <Badge label={isCompany ? "Empresa" : "Autônomo"} tone={isCompany ? "primary" : "accent"} />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] - 1 }}>
            {category ? (
              <Text variant="label" color="primaryStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
                {category}
              </Text>
            ) : null}
            {rating ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                <Star size={12} color={colors.accent} fill={colors.accent} />
                <Text variant="label">{rating}</Text>
                <Text variant="caption" color="textMuted">
                  ({provider.review_count})
                </Text>
              </View>
            ) : (
              <Text variant="caption" color="textMuted">
                Sem avaliações ainda
              </Text>
            )}
            {discountLabel ? <Badge label={discountLabel} tone="accent" /> : null}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <MapPin size={11} color={colors.textMuted} />
              <Text variant="caption" color="textSecondary" numberOfLines={1}>
                {distance ?? provider.neighborhood}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: isOpen ? colors.successSoft : colors.surface2,
                borderRadius: radii.full,
                paddingVertical: 3,
                paddingHorizontal: 7,
              }}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: radii.full,
                  backgroundColor: isOpen ? colors.success : colors.textMuted,
                }}
              />
              <Text variant="caption" color={isOpen ? "success" : "textMuted"}>
                {isOpen ? "Aberto agora" : "Fechado"}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={favorited ? `Remover ${name} dos favoritos` : `Salvar ${name} nos favoritos`}
        onPress={onToggleFavorite}
        hitSlop={8}
        style={{
          width: 32,
          height: 32,
          borderRadius: radii.full,
          backgroundColor: favorited ? colors.dangerSoft : colors.surface2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Heart
          size={16}
          color={favorited ? colors.danger : colors.textMuted}
          fill={favorited ? colors.danger : "transparent"}
        />
      </Pressable>
    </Card>
  );
}
