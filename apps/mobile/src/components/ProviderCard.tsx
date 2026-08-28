import { Badge, Card, Text, useTheme } from "@eufaco/design-system/native";
import { Heart, MapPin, Star, Tag } from "lucide-react-native";
import { Pressable, View } from "react-native";
import type { Provider } from "@/data/mock";

export function ProviderCard({ provider, onPress }: { provider: Provider; onPress?: () => void }) {
  const { colors, radii, spacing } = useTheme();
  const isCompany = provider.type === "company";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${provider.name}, ${provider.category}, nota ${provider.rating}`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <Card style={{ flexDirection: "row", gap: spacing[3], alignItems: "flex-start" }}>
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
            {provider.initials}
          </Text>
        </View>

        <View style={{ flex: 1, gap: spacing[1] + 1, paddingTop: 3 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] - 2 }}>
            <Text variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>
              {provider.name}
            </Text>
            <Badge
              label={isCompany ? "Empresa" : "Autônomo"}
              tone={isCompany ? "primary" : "accent"}
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] - 1 }}>
            <Text variant="label" color="primaryStrong">
              {provider.category}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Star size={12} color={colors.accent} fill={colors.accent} />
              <Text variant="label">{provider.rating}</Text>
              <Text variant="caption" color="textMuted">
                ({provider.reviews})
              </Text>
            </View>
            {provider.discount ? <Badge label={provider.discount} tone="accent" /> : null}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[2] }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <MapPin size={11} color={colors.textMuted} />
              <Text variant="caption" color="textSecondary">
                {provider.distance}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: provider.open ? colors.successSoft : colors.surface2,
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
                  backgroundColor: provider.open ? colors.success : colors.textMuted,
                }}
              />
              <Text variant="caption" color={provider.open ? "success" : "textMuted"}>
                {provider.open ? "Aberto agora" : "Fecha às 18h"}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Salvar ${provider.name} nos favoritos`}
          hitSlop={8}
          style={{
            width: 32,
            height: 32,
            borderRadius: radii.full,
            backgroundColor: colors.surface2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Heart size={16} color={colors.textMuted} />
        </Pressable>
      </Card>
    </Pressable>
  );
}
