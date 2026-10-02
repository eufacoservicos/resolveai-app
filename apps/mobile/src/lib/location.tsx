import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_RADIUS_KM, type LocationData } from "@eufaco/shared";
import * as Location from "expo-location";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "eufaco.location";

interface LocationState {
  location: LocationData | null;
  /** Raio de busca em km. Só se aplica quando a localização é por GPS. */
  radiusKm: number;
  /** Falso até sabermos se há localização salva. */
  loading: boolean;
  setCity: (city: string) => Promise<void>;
  /** Pede permissão e usa o GPS. Devolve mensagem de erro, ou null se deu certo. */
  useCurrentPosition: () => Promise<string | null>;
  setRadius: (km: number) => Promise<void>;
  clear: () => Promise<void>;
  /** Rótulo curto para a pill do cabeçalho. */
  label: string;
}

const LocationContext = createContext<LocationState | null>(null);

interface Stored {
  location: LocationData | null;
  radiusKm: number;
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const parsed = JSON.parse(raw) as Stored;
        setLocation(parsed.location ?? null);
        setRadiusKm(parsed.radiusKm ?? DEFAULT_RADIUS_KM);
      })
      .catch(() => {
        // Storage corrompido: seguir sem localização é melhor que travar
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = async (next: LocationData | null, radius: number) => {
    setLocation(next);
    setRadiusKm(radius);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ location: next, radiusKm: radius }));
  };

  const value = useMemo<LocationState>(() => {
    const label =
      location?.type === "geo"
        ? location.label
        : location?.type === "city"
          ? location.city
          : "Escolher localização";

    return {
      location,
      radiusKm,
      loading,
      label,
      setCity: (city) => persist({ type: "city", city }, radiusKm),
      setRadius: (km) => persist(location, km),
      clear: () => persist(null, DEFAULT_RADIUS_KM),
      useCurrentPosition: async () => {
        const { granted } = await Location.requestForegroundPermissionsAsync();
        if (!granted) {
          return "Precisamos da sua localização para achar quem atende perto. Libere nos ajustes do aparelho.";
        }

        try {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          // O nome do bairro deixa a pill legível; sem ele, mostramos a cidade
          const [place] = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          const label =
            [place?.district ?? place?.subregion, place?.city ?? place?.region]
              .filter(Boolean)
              .join(", ") || "Perto de você";

          await persist(
            {
              type: "geo",
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              label,
            },
            radiusKm,
          );
          return null;
        } catch {
          return "Não foi possível obter sua localização. Tente de novo ou escolha uma cidade.";
        }
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, radiusKm, loading]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationState {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation foi chamado fora do LocationProvider.");
  return ctx;
}

/** Converte a localização escolhida nos filtros que as queries entendem. */
export function locationFilters(location: LocationData | null, radiusKm: number) {
  if (location?.type === "geo") {
    return { latitude: location.lat, longitude: location.lng, radiusKm };
  }
  if (location?.type === "city") {
    return { city: location.city };
  }
  return {};
}
