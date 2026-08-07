import { Pressable, View } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { Muted, Text } from "@/components/ui/text";

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View className="mb-5 flex-row items-center justify-between px-1">
      <View className="flex-1 pr-3">
        <Text className="text-2xl font-black leading-8 tracking-tight text-foreground">
          {title}
        </Text>
        {subtitle && <Muted className="mt-1 text-sm">{subtitle}</Muted>}
      </View>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          hitSlop={10}
          className="flex-row items-center gap-1 active:opacity-70"
        >
          <Text className="text-sm font-bold text-primary">{actionLabel}</Text>
          <ArrowRight size={15} color="#22d3ee" />
        </Pressable>
      )}
    </View>
  );
}
