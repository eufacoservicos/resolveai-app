import { View, Text } from "react-native";
import type { ViewProps, TextProps } from "react-native";
import { cn } from "@resolveai/shared/cn";

type Props = ViewProps & {
  className?: string;
  variant?: "default" | "glass" | "elevated";
};
type TextClassProps = TextProps & { className?: string };

const CARD_VARIANTS: Record<NonNullable<Props["variant"]>, string> = {
  default: "rounded-3xl border border-border bg-card p-5",
  glass: "rounded-3xl border border-white/10 bg-white/[0.04] p-5",
  elevated:
    "rounded-3xl border border-border bg-card p-5 shadow-2xl shadow-black/60",
};

export function Card({ className, variant = "default", ...props }: Props) {
  return <View className={cn(CARD_VARIANTS[variant], className)} {...props} />;
}

export function CardHeader({ className, ...props }: Props) {
  return <View className={cn("mb-3 gap-1", className)} {...props} />;
}

export function CardTitle({ className, ...props }: TextClassProps) {
  return (
    <Text
      className={cn("text-lg font-bold text-foreground", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: TextClassProps) {
  return (
    <Text
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: Props) {
  return <View className={cn("gap-3", className)} {...props} />;
}

export function CardFooter({ className, ...props }: Props) {
  return <View className={cn("mt-4 gap-2", className)} {...props} />;
}
