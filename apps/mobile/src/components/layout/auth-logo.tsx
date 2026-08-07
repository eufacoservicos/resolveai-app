import { View } from "react-native";
import Logo from "../../../assets/logo.svg";

/**
 * Logo do topo das telas de auth. Usa o mesmo logo.svg do PWA (o logo.png tem
 * fundo azul e nao serve para o fundo claro dessas telas).
 * No web e h-20 (80px) com largura automatica.
 */
export function AuthLogo() {
  return (
    <View className="mb-8 items-center">
      <Logo width={218} height={80} />
    </View>
  );
}
