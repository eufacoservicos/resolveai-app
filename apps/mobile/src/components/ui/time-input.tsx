import { TextInput } from "react-native";
import { cn } from "@resolveai/shared/cn";

// Nao existe <input type="time"> no RN. Em vez de puxar um date picker nativo
// so para isso, o campo e mascarado em HH:MM — mesmo formato de string que o
// banco espera (business_hours.open_time / close_time).
type Props = {
  value: string;
  onChangeText: (value: string) => void;
  className?: string;
};

/** Aceita apenas digitos e insere os dois pontos: "0830" -> "08:30" */
function maskTime(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/**
 * Completa e corrige o valor ao sair do campo: "8" -> "08:00", "24:99" -> "23:59".
 * Ate dois digitos sao lidos como hora (nao como "80:00"), e os minutos sao
 * completados a direita ("083" -> "08:30").
 */
export function normalizeTime(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 0) return "00:00";

  const rawHours = digits.length <= 2 ? digits : digits.slice(0, 2);
  const rawMinutes = digits.length <= 2 ? "0" : digits.slice(2).padEnd(2, "0");

  const hours = Math.min(23, parseInt(rawHours, 10) || 0);
  const minutes = Math.min(59, parseInt(rawMinutes, 10) || 0);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function TimeInput({ value, onChangeText, className }: Props) {
  return (
    <TextInput
      value={value}
      onChangeText={(text) => onChangeText(maskTime(text))}
      onBlur={() => onChangeText(normalizeTime(value))}
      keyboardType="number-pad"
      placeholder="00:00"
      placeholderTextColor="#5c6478"
      maxLength={5}
      // min-w-0 e obrigatorio: no React Native Web o TextInput vira <input>,
      // que tem largura intrinseca e min-width:auto — sem isso o flex-1 nao
      // encolhe e os dois campos estouram a largura da tela.
      className={cn(
        "h-8 min-w-0 flex-1 rounded-md border border-border px-2 text-center text-sm text-foreground",
        className
      )}
    />
  );
}
