import { getCities } from "@eufaco/shared";
import { Button, Card, Text, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { Check, MapPin, Navigation } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
          paddingTop: insets.top + spacing[5],
          paddingHorizontal: spacing[6],
          paddingBottom: spacing[8],
          gap: spacing[5],
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
              opacity: 0.55,
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

        <View style={{ gap: spacing[2], alignItems: "center" }}>
          <Text variant="h1" style={{ textAlign: "center" }}>
            Onde você está?
          </Text>
          <Text color="textSecondary" style={{ textAlign: "center" }}>
            Assim mostramos apenas profissionais que atendem na sua região.
          </Text>
        </View>

        <View style={{ alignSelf: "stretch" }}>
          <Button
            label="Usar minha localização"
            loading={locating}
            icon={<Navigation size={18} color={colors.onPrimary} />}
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

        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing[3], alignSelf: "stretch" }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text variant="caption" color="textMuted">
            ou escolha uma cidade
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        <View style={{ alignSelf: "stretch", gap: spacing[2] }}>
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
                <Pressable
                  key={city}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Ver profissionais em ${city}`}
                  onPress={() => void choose(city)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                >
                  <Card
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing[3],
                      paddingVertical: spacing[3],
                      borderColor: selected ? colors.primary : colors.border,
                      borderWidth: selected ? 1.5 : 1,
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        backgroundColor: selected ? colors.primary : colors.surface2,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MapPin size={16} color={selected ? colors.onPrimary : colors.textSecondary} />
                    </View>
                    <Text variant="bodyStrong" style={{ flex: 1 }}>
                      {city}
                    </Text>
                    {selected ? <Check size={18} color={colors.primaryStrong} /> : null}
                  </Card>
                </Pressable>
              );
            })
          )}
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8}>
          <Text variant="title" color="textMuted">
            Agora não
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
