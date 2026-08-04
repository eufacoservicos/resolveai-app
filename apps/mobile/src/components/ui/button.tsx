import { forwardRef } from "react";
import { Pressable, Text, ActivityIndicator, View } from "react-native";
import type { PressableProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@resolveai/shared/cn";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary active:opacity-90",
        destructive: "bg-destructive active:opacity-90",
        outline: "border border-border bg-background active:bg-muted",
        secondary: "bg-muted active:opacity-90",
        ghost: "active:bg-muted",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3",
        lg: "h-12 px-6",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("text-sm font-semibold", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-foreground",
      secondary: "text-foreground",
      ghost: "text-foreground",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-base",
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
      variant,
      size,
      children,
      loading,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
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
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : typeof children === "string" ? (
          <Text
            className={cn(buttonTextVariants({ variant, size }), textClassName)}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants, buttonTextVariants };
