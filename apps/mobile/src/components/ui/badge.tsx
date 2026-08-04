import { View, Text } from "react-native";
import type { ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@resolveai/shared/cn";

const badgeVariants = cva("self-start rounded-full px-2.5 py-0.5", {
  variants: {
    variant: {
      default: "bg-primary",
      secondary: "bg-muted",
      destructive: "bg-destructive",
      outline: "border border-border bg-transparent",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const badgeTextVariants = cva("text-xs font-semibold", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-muted-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BadgeProps = ViewProps &
  VariantProps<typeof badgeVariants> & {
    children?: React.ReactNode;
    className?: string;
    textClassName?: string;
  };

export function Badge({
  className,
  textClassName,
  variant,
  children,
  ...props
}: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      {typeof children === "string" ? (
        <Text className={cn(badgeTextVariants({ variant }), textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
