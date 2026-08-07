import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import {
  validateLocationData,
  type LocationData,
} from "@resolveai/shared/location";

// Equivalente nativo do cookie "user-location" do PWA: mesma forma de dado
// (@resolveai/shared/location), persistida em AsyncStorage. O PWA le no server
// e re-renderiza via router.refresh(); aqui o estado vive em contexto.
const LOCATION_STORAGE_KEY = "user-location";

type LocationContextValue = {
  location: LocationData | null;
  /** true ate terminar a leitura inicial do AsyncStorage */
  isLoading: boolean;
  /** true enquanto o GPS esta sendo consultado */
  isDetecting: boolean;
  setLocation: (location: LocationData) => Promise<void>;
  clearLocation: () => Promise<void>;
  /** Pede permissao e resolve a posicao atual. Retorna null se negado/falhou. */
  detectLocation: () => Promise<LocationData | null>;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(LOCATION_STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        if (raw) {
          try {
            setLocationState(validateLocationData(JSON.parse(raw)));
          } catch {
            setLocationState(null);
          }
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const setLocation = useCallback(async (next: LocationData) => {
    setLocationState(next);
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const clearLocation = useCallback(async () => {
    setLocationState(null);
    await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
  }, []);

  const detectLocation = useCallback(async (): Promise<LocationData | null> => {
    setIsDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return null;

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const next: LocationData = {
        type: "geo",
        lat: parseFloat(position.coords.latitude.toFixed(6)),
        lng: parseFloat(position.coords.longitude.toFixed(6)),
        label: "Minha localização",
      };

      await setLocation(next);
      return next;
    } catch {
      return null;
    } finally {
      setIsDetecting(false);
    }
  }, [setLocation]);

  const value = useMemo(
    () => ({
      location,
      isLoading,
      isDetecting,
      setLocation,
      clearLocation,
      detectLocation,
    }),
    [location, isLoading, isDetecting, setLocation, clearLocation, detectLocation]
  );

  return (
    <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
  );
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation precisa estar dentro de <LocationProvider>");
  }
  return ctx;
}
