import { Switch, type SwitchProps } from "react-native";
import { useTheme } from "./theme";

export interface ToggleProps extends Omit<SwitchProps, "trackColor" | "thumbColor"> {
  /** Rótulo lido por leitores de tela. Obrigatório: um switch sem nome não diz o que faz. */
  accessibilityLabel: string;
}

/**
 * Switch do sistema com as cores da marca.
 *
 * Usa o componente nativo em vez de um desenho próprio para herdar o
 * comportamento de acessibilidade e o gesto de arrastar que as pessoas
 * já conhecem do aparelho.
 */
export function Toggle({ value, ...rest }: ToggleProps) {
  const { colors } = useTheme();

  return (
    <Switch
      value={value}
      trackColor={{ false: colors.surface3, true: colors.primary }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={colors.surface3}
      {...rest}
    />
  );
}
