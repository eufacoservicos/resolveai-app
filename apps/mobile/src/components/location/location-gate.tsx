import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocation } from "@/lib/location-provider";
import { CitySelectorDialog } from "./city-selector-dialog";
import { Text } from "@/components/ui/text";

// Porta do LocationGate do PWA: na primeira abertura tenta o GPS e, se negar
// ou falhar, abre o seletor de cidade. Se ja houver localizacao salva, no-op.
export function LocationGate({ cities }: { cities: string[] }) {
  const { location, isLoading, isDetecting, detectLocation, setLocation } =
    useLocation();
  const [showCitySelector, setShowCitySelector] = useState(false);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (isLoading || attemptedRef.current) return;
    attemptedRef.current = true;

    if (location) return;

    detectLocation().then((result) => {
      if (!result) setShowCitySelector(true);
    });
  }, [isLoading, location, detectLocation]);

  function handleCitySelect(city: string) {
    void setLocation({ type: "city", city });
    setShowCitySelector(false);
  }

  return (
    <>
      {isDetecting && (
        <View className="flex-row items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <ActivityIndicator size="small" color="#22d3ee" />
          <Text className="text-sm text-primary">
            Detectando sua localização...
          </Text>
        </View>
      )}

      <CitySelectorDialog
        open={showCitySelector}
        onOpenChange={setShowCitySelector}
        cities={cities}
        title="Selecione sua cidade"
        description="Para ver profissionais perto de você"
        onSelectCity={handleCitySelect}
      />
    </>
  );
}
