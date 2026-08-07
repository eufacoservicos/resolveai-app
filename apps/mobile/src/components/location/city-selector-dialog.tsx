import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { MapPin, Navigation, Search } from "lucide-react-native";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Text, Muted } from "@/components/ui/text";

// A lista de cidades com busca e identica no LocationGate e no LocationChip do
// PWA; aqui ela e um componente unico parametrizado por titulo/descricao.
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cities: string[];
  title: string;
  description: string;
  onSelectCity: (city: string) => void;
  /** Quando ausente, o atalho "Usar minha localizacao" nao e exibido. */
  onUseGeolocation?: () => void;
};

export function CitySelectorDialog({
  open,
  onOpenChange,
  cities,
  title,
  description,
  onSelectCity,
  onUseGeolocation,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredCities = cities.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      {onUseGeolocation && (
        <Pressable
          onPress={onUseGeolocation}
          className="flex-row items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 active:bg-muted"
        >
          <Navigation size={16} color="#22d3ee" />
          <Text className="text-sm">Usar minha localização</Text>
        </Pressable>
      )}

      <View className="relative justify-center">
        <View className="absolute left-3 z-10">
          <Search size={16} color="#8891a4" />
        </View>
        <TextInput
          placeholder="Buscar cidade..."
          placeholderTextColor="#8891a4"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground"
        />
      </View>

      <ScrollView className="max-h-60" keyboardShouldPersistTaps="handled">
        {filteredCities.length === 0 ? (
          <Muted className="py-4 text-center">Nenhuma cidade encontrada</Muted>
        ) : (
          filteredCities.map((city) => (
            <Pressable
              key={city}
              onPress={() => onSelectCity(city)}
              className="flex-row items-center gap-2.5 rounded-lg px-3 py-2.5 active:bg-muted"
            >
              <MapPin size={16} color="#8891a4" />
              <Text className="text-sm">{city}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </Dialog>
  );
}
