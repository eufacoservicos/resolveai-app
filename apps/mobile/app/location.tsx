import { getCities } from "@eufaco/shared";
import {
  Button,
  Card,
  Text,
  fontSize,
  letterSpacing,
  lineHeight,
  useTheme,
} from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { MapPin, Navigation } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListRow } from "@/components/ListRow";
import { useLocation } from "@/lib/location";
import { supabase } from "@/lib/supabase";

export default function LocationScreen() {
  const { colors, radii, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { location, setCity, useCurrentPosition } = useLocation();

  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCities(supabase)
      .then((result) => {
        if (active) setCities(result);
      })
      .finally(() => {
        if (active) setLoadingCities(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const detect = async () => {
    setLocating(true);
    setError(null);
    const message = await useCurrentPosition();
    setLocating(false);

    if (message) {
      setError(message);
      return;
    }
    router.back();
  };

  const choose = async (city: string) => {
    await setCity(city);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 18,
          paddingHorizontal: spacing[6],
          paddingBottom: 28,
          gap: 22,
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Círculos concêntricos: a mesma ideia de alcance do protótipo */}
        <View style={{ width: 150, height: 150, alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              position: "absolute",
              width: 150,
              height: 150,
              borderRadius: radii.full,
              backgroundColor: colors.primarySoft,
            }}
          />
          <View
            style={{
              position: "absolute",
              width: 100,
              height: 100,
              borderRadius: radii.full,
              backgroundColor: colors.primarySoft,
            }}
          />
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: radii.full,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MapPin size={28} color={colors.onPrimary} />
          </View>
        </View>

        <View style={{ gap: 6, alignItems: "center" }}>
          <Text variant="h1" style={{ textAlign: "center" }}>
            Onde você está?
          </Text>
          <Text
            color="textSecondary"
            style={{
              textAlign: "center",
              fontSize: fontSize.name,
              lineHeight: fontSize.name * lineHeight.normal,
            }}
          >
            Assim mostramos apenas profissionais que atendem na sua região.
          </Text>
        </View>

        <View style={{ alignSelf: "stretch" }}>
          <Button
            label="Usar minha localização"
            loading={locating}
            icon={<Navigation size={18} color={colors.onPrimary} />}
            iconPosition="right"
            onPress={() => void detect()}
          />
        </View>

        {error ? (
          <Card variant="plain" style={{ alignSelf: "stretch", backgroundColor: colors.dangerSoft }}>
            <Text variant="bodyStrong" color="danger">
              {error}
            </Text>
          </Card>
        ) : null}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, alignSelf: "stretch" }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text variant="caption" color="textMuted">
            ou escolha uma cidade
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        <View style={{ alignSelf: "stretch", gap: 8 }}>
          {loadingCities ? (
            <View style={{ paddingVertical: spacing[6], alignItems: "center" }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : cities.length === 0 ? (
            <Card style={{ alignItems: "center", paddingVertical: spacing[6] }}>
              <Text color="textSecondary" style={{ textAlign: "center" }}>
                Ainda não há profissionais cadastrados em nenhuma cidade.
              </Text>
            </Card>
          ) : (
            cities.map((city) => {
              const selected = location?.type === "city" && location.city === city;
              return (
                <ListRow
                  key={city}
                  label={city}
                  icon={MapPin}
                  badge={selected ? "Atual" : undefined}
                  onPress={() => void choose(city)}
                />
              );
            })
          )}
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
          <Text
            variant="titleSm"
            color="textMuted"
            style={{ fontSize: fontSize.chip, letterSpacing: letterSpacing.normal }}
          >
            Agora não
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
