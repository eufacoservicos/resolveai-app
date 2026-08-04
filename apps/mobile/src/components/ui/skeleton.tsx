import { useEffect } from "react";
import { View } from "react-native";
import type { ViewProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { cn } from "@resolveai/shared/cn";

type SkeletonProps = ViewProps & { className?: string };

export function Skeleton({ className, style, ...props }: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={cn("rounded-md bg-muted", className)}
      style={[style, animatedStyle]}
      {...props}
    />
  );
}
