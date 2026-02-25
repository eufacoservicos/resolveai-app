"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, X, Search, Navigation } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  LOCATION_COOKIE_NAME,
  LOCATION_COOKIE_MAX_AGE,
  serializeLocationCookie,
  type LocationData,
} from "@/lib/location-cookie";

interface LocationChipProps {
  cities: string[];
  currentLocation: LocationData | null;
}

export function LocationChip({ cities, currentLocation }: LocationChipProps) {
  const router = useRouter();
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [search, setSearch] = useState("");

  if (!currentLocation) return null;

  const label =
    currentLocation.type === "geo"
      ? currentLocation.label
      : currentLocation.city;

  function handleClear() {
    document.cookie = `${LOCATION_COOKIE_NAME}=; path=/; max-age=0`;
    router.refresh();
  }

  function handleCitySelect(city: string) {
    const value = serializeLocationCookie({ type: "city", city });
    document.cookie = `${LOCATION_COOKIE_NAME}=${value}; path=/; max-age=${LOCATION_COOKIE_MAX_AGE}; samesite=lax`;
    setShowCitySelector(false);
    router.refresh();
  }

  function handleUseGeolocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const value = serializeLocationCookie({
          type: "geo",
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6)),
          label: "Minha localização",
        });
        document.cookie = `${LOCATION_COOKIE_NAME}=${value}; path=/; max-age=${LOCATION_COOKIE_MAX_AGE}; samesite=lax`;
        setShowCitySelector(false);
        router.refresh();
      },
      () => {
        // Keep city selector open if geo fails
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  const filteredCities = cities.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowCitySelector(true)}
          className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 h-8 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
        >
          <MapPin className="h-3 w-3" />
          {label}
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 rounded-full border border-border px-2.5 h-7 text-xs text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-3 w-3" />
          Limpar
        </button>
      </div>

      <Dialog open={showCitySelector} onOpenChange={setShowCitySelector}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar localização</DialogTitle>
            <DialogDescription>
              Selecione uma cidade ou use sua localização
            </DialogDescription>
          </DialogHeader>

          <button
            onClick={handleUseGeolocation}
            className="flex w-full items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm hover:bg-muted transition-colors"
          >
            <Navigation className="h-4 w-4 text-primary shrink-0" />
            Usar minha localização
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar cidade..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredCities.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhuma cidade encontrada
              </p>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-left hover:bg-muted transition-colors"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  {city}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
