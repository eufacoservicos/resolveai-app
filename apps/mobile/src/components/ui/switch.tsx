import { Pressable, View } from "react-native";
import { cn } from "@resolveai/shared/cn";

type Props = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  accessibilityLabel?: string;
};

export function Switch({ checked, onCheckedChange, accessibilityLabel }: Props) {
  return (
    <Pressable
      onPress={() => onCheckedChange(!checked)}
      hitSlop={6}
      accessibilityRole="switch"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      className={cn(
        "h-5 w-9 justify-center rounded-full px-0.5",
        checked ? "bg-primary" : "bg-border"
      )}
    >
      <View
        className="h-4 w-4 rounded-full bg-white"
        style={{ transform: [{ translateX: checked ? 16 : 0 }] }}
      />
    </Pressable>
  );
}
