import { forwardRef } from "react";
import { TextInput } from "react-native";
import type { TextInputProps } from "react-native";
import { cn } from "@resolveai/shared/cn";

type InputProps = TextInputProps & {
  className?: string;
  invalid?: boolean;
};

export const Input = forwardRef<TextInput, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        placeholderTextColor="#94a3b8"
        className={cn(
          "h-11 rounded-md border border-border bg-background px-3 text-base text-foreground",
          "focus:border-primary",
          invalid && "border-destructive",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
