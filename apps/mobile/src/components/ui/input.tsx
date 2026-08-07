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
        placeholderTextColor="#5c6478"
        selectionColor="#22d3ee"
        className={cn(
          "h-12 rounded-2xl border border-border bg-card/60 px-4 text-base text-foreground",
          "focus:border-primary/60 focus:bg-card",
          invalid && "border-destructive",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
