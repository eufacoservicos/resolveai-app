import { View, Text } from "react-native";
import { Image } from "expo-image";
import { cn } from "@resolveai/shared/cn";

type AvatarProps = {
  src?: string | null;
  fallback?: string;
  size?: number;
  className?: string;
};

export function Avatar({ src, fallback, size = 40, className }: AvatarProps) {
  const initials = fallback
    ? fallback
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <View
      className={cn(
        "items-center justify-center overflow-hidden rounded-full bg-muted",
        className
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          style={{ width: size, height: size }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <Text
          className="font-semibold text-muted-foreground"
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
}
