import { forwardRef } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { PressableProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@resolveai/shared/cn";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary active:opacity-90",
        gradient: "bg-primary active:opacity-90",
        destructive: "bg-destructive active:opacity-90",
        outline: "border border-border bg-card/60 active:bg-card",
        secondary: "bg-muted active:opacity-90",
        ghost: "active:bg-muted",
        glass: "border border-white/10 bg-white/[0.06] active:bg-white/[0.10]",
      },
      size: {
        default: "h-12 rounded-2xl px-5",
        sm: "h-10 rounded-xl px-4",
        lg: "h-14 rounded-2xl px-6",
        xl: "h-16 rounded-3xl px-8",
        icon: "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("font-semibold", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      gradient: "text-primary-foreground",
      destructive: "text-white",
      outline: "text-foreground",
      secondary: "text-foreground",
      ghost: "text-foreground",
      glass: "text-foreground",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-base",
      xl: "text-lg",
      icon: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonProps = Omit<PressableProps, "children"> &
  VariantProps<typeof buttonVariants> & {
    children?: React.ReactNode;
    loading?: boolean;
    className?: string;
    textClassName?: string;
  };

export const Button = forwardRef<View, ButtonProps>(
  (
    {
      className,
      textClassName,
      variant = "default",
      size,
      children,
      loading,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const showGradient = variant === "gradient";

    const content =
      loading ? (
        <ActivityIndicator size="small" color={showGradient ? "#05070a" : "#ffffff"} />
      ) : typeof children === "string" ? (
        <Text
          className={cn(buttonTextVariants({ variant, size }), textClassName)}
        >
          {children}
        </Text>
      ) : (
        children
      );

    return (
      <Pressable
        ref={ref as never}
        disabled={isDisabled}
        className={cn(
          buttonVariants({ variant, size }),
          isDisabled && "opacity-50",
          className
        )}
        {...props}
      >
        {showGradient && (
          <LinearGradient
            colors={["#22d3ee", "#38bdf8", "#6366f1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}
        {content}
      </Pressable>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants, buttonTextVariants };
