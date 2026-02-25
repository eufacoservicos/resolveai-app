"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2, Search } from "lucide-react";
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
} from "@/lib/location-cookie";

interface LocationGateProps {
  cities: string[];
}

export function LocationGate({ cities }: LocationGateProps) {
  const router = useRouter();
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Check if cookie already exists
    const hasCookie = document.cookie
      .split("; ")
      .some((c) => c.startsWith(LOCATION_COOKIE_NAME + "="));
    if (hasCookie) return;

    // Try geolocation
    if (!navigator.geolocation) {
      setShowCitySelector(true);
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const value = serializeLocationCookie({
          type: "geo",
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6)),
          label: "Minha localização",
        });
        document.cookie = `${LOCATION_COOKIE_NAME}=${value}; path=/; max-age=${LOCATION_COOKIE_MAX_AGE}; samesite=lax`;
        setDetecting(false);
        router.refresh();
      },
      () => {
        setDetecting(false);
        setShowCitySelector(true);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [router]);

  function handleCitySelect(city: string) {
    const value = serializeLocationCookie({ type: "city", city });
    document.cookie = `${LOCATION_COOKIE_NAME}=${value}; path=/; max-age=${LOCATION_COOKIE_MAX_AGE}; samesite=lax`;
    setShowCitySelector(false);
    router.refresh();
  }

  const filteredCities = cities.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {detecting && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Detectando sua localização...
        </div>
      )}

      <Dialog open={showCitySelector} onOpenChange={setShowCitySelector}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Selecione sua cidade</DialogTitle>
            <DialogDescription>
              Para ver profissionais perto de você
            </DialogDescription>
          </DialogHeader>

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
