import { useState } from "react";
import { Pressable } from "react-native";
import { MapPin } from "lucide-react-native";
import { getLocationLabel } from "@resolveai/shared/location";
import { useLocation } from "@/lib/location-provider";
import { CitySelectorDialog } from "./city-selector-dialog";
import { Text } from "@/components/ui/text";

// Porta do LocationChip do PWA: pilula com a localizacao atual que abre o
// seletor de cidade (com atalho para GPS).
export function LocationChip({ cities }: { cities: string[] }) {
  const { location, setLocation, detectLocation } = useLocation();
  const [showCitySelector, setShowCitySelector] = useState(false);

  const label = getLocationLabel(location);
  if (!location) return null;

  function handleCitySelect(city: string) {
    void setLocation({ type: "city", city });
    setShowCitySelector(false);
  }

  function handleUseGeolocation() {
    detectLocation().then((result) => {
      // Mantem o seletor aberto se o GPS falhar, igual ao PWA.
      if (result) setShowCitySelector(false);
    });
  }

  return (
    <>
      <Pressable
        onPress={() => setShowCitySelector(true)}
        className="h-9 flex-row items-center gap-2 self-start rounded-full border border-primary/30 bg-primary/10 px-3.5 active:bg-primary/20"
      >
        <MapPin size={13} color="#22d3ee" />
        <Text className="text-xs font-bold text-primary">{label}</Text>
      </Pressable>

      <CitySelectorDialog
        open={showCitySelector}
        onOpenChange={setShowCitySelector}
        cities={cities}
        title="Alterar localização"
        description="Selecione uma cidade ou use sua localização"
        onSelectCity={handleCitySelect}
        onUseGeolocation={handleUseGeolocation}
      />
    </>
  );
}
