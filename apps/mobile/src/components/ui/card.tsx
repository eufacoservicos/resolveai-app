import { View, Text } from "react-native";
import type { ViewProps, TextProps } from "react-native";
import { cn } from "@resolveai/shared/cn";

type Props = ViewProps & { className?: string };
type TextClassProps = TextProps & { className?: string };

export function Card({ className, ...props }: Props) {
  return (
    <View
      className={cn("rounded-2xl border border-border bg-background p-4", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: Props) {
  return <View className={cn("mb-3 gap-1", className)} {...props} />;
}

export function CardTitle({ className, ...props }: TextClassProps) {
  return (
    <Text
      className={cn("text-lg font-semibold text-foreground", className)}
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
