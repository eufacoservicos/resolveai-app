import { Pressable, View } from "react-native";
import { Check } from "lucide-react-native";
import { cn } from "@resolveai/shared/cn";

type Props = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  accessibilityLabel?: string;
  className?: string;
};

export function Checkbox({
  checked,
  onCheckedChange,
  accessibilityLabel,
  className,
}: Props) {
  return (
    <Pressable
      onPress={() => onCheckedChange(!checked)}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      className={cn(
        "h-4 w-4 items-center justify-center rounded border",
        checked ? "border-primary bg-primary" : "border-border bg-card",
        className
      )}
    >
      {checked && <Check size={12} color="#ffffff" />}
    </Pressable>
  );
}
