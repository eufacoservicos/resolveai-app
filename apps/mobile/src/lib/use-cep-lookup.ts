import { useCallback, useState } from "react";
import { toast } from "sonner-native";
import {
  fetchCepData,
  formatCep,
  geocodeAddress,
} from "@resolveai/shared/validators/cep";

export type AddressInfo = {
  city: string;
  state: string;
  neighborhood: string;
  latitude: number | null;
  longitude: number | null;
};

/**
 * Busca de CEP + geocoding compartilhada pelos tres formularios de prestador
 * (provider/edit, become-provider e complete-profile). Mesma sequencia do PWA:
 * ao completar 8 digitos consulta o ViaCEP e, se achou, geocodifica.
 */
export function useCepLookup(
  initialAddress: AddressInfo | null = null,
  initialCep = ""
) {
  // Hidrata ja formatado, sem disparar a busca do CEP salvo
  const [cep, setCepState] = useState(() =>
    formatCep(initialCep.replace(/\D/g, ""))
  );
  const [cepLoading, setCepLoading] = useState(false);
  const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(
    initialAddress
  );

  const setCep = useCallback(async (input: string) => {
    const raw = input.replace(/\D/g, "").slice(0, 8);
    setCepState(formatCep(raw));

    if (raw.length !== 8) {
      setAddressInfo(null);
      return;
    }

    setCepLoading(true);
    const data = await fetchCepData(raw);
    if (data) {
      const coords = await geocodeAddress(
        data.city,
        data.state,
        data.neighborhood
      );
      setAddressInfo({
        city: data.city,
        state: data.state,
        neighborhood: data.neighborhood,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      });
    } else {
      setAddressInfo(null);
      toast.error("CEP não encontrado. Verifique e tente novamente.");
    }
    setCepLoading(false);
  }, []);

  return { cep, setCep, cepLoading, addressInfo, setAddressInfo };
}

/** Linha "Bairro, Cidade - UF" exibida abaixo do campo de CEP */
export function formatAddressLine(address: AddressInfo): string {
  const prefix = address.neighborhood ? `${address.neighborhood}, ` : "";
  const suffix = address.state ? ` - ${address.state}` : "";
  return `${prefix}${address.city}${suffix}`;
}
