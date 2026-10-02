import { isProviderOpenNow, type ProviderWithDetails } from "@eufaco/shared";
import { Badge, Card, Text, useTheme } from "@eufaco/design-system/native";
import { Briefcase, Heart, MapPin, Star, Tag, UserRound } from "lucide-react-native";
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

/** Ponto separador entre metadados, como no Pen. */
function Dot() {
  const { colors } = useTheme();
  return (
    <View style={{ width: 3, height: 3, borderRadius: 999, backgroundColor: colors.textMuted }} />
  );
}

export function ProviderCard({
  provider,
  onPress,
  onToggleFavorite,
  favorited = false,
  discountLabel = null,
}: Props) {
  const { colors, radii } = useTheme();

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
    <Card style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
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
          gap: 12,
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
          <Text variant="initialsLg" color="primaryStrong">
            {initialsOf(name)}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 5, paddingTop: 3 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>
              {name}
            </Text>
            <Badge
              label={isCompany ? "Empresa" : "Autônomo"}
              tone={isCompany ? "primary" : "accent"}
              icon={
                isCompany ? (
                  <Briefcase size={10} color={colors.primaryStrong} />
                ) : (
                  <UserRound size={10} color={colors.accent} />
                )
              }
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            {category ? (
              <Text variant="label" color="primaryStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
                {category}
              </Text>
            ) : null}
            {category && rating ? <Dot /> : null}
            {rating ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                <Star size={12} color={colors.accent} fill={colors.accent} />
                <Text variant="labelStrong">{rating}</Text>
                <Text variant="caption" color="textMuted">
                  ({provider.review_count})
                </Text>
              </View>
            ) : (
              <Text variant="caption" color="textMuted" numberOfLines={1} style={{ flexShrink: 1 }}>
                Sem avaliações ainda
              </Text>
            )}
            {discountLabel ? (
              <Badge
                label={discountLabel}
                tone="accent"
                compact
                icon={<Tag size={9} color={colors.accent} />}
              />
            ) : null}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 2 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <MapPin size={11} color={colors.textMuted} />
              <Text variant="caption" color="textSecondary" numberOfLines={1}>
                {distance ?? provider.neighborhood}
              </Text>
            </View>
            <Badge
              label={isOpen ? "Aberto agora" : "Fechado"}
              tone={isOpen ? "success" : "neutral"}
              dot
            />
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
