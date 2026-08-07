import { TextInput } from "react-native";
import type { TextInputProps } from "react-native";
import { cn } from "@resolveai/shared/cn";

type TextareaProps = Omit<TextInputProps, "multiline"> & {
  className?: string;
  rows?: number;
};

export function Textarea({ className, rows = 3, style, ...props }: TextareaProps) {
  return (
    <TextInput
      multiline
      textAlignVertical="top"
      placeholderTextColor="#8891a4"
      className={cn(
        "rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground",
        className
      )}
      style={[{ minHeight: rows * 22 + 20 }, style]}
      {...props}
    />
  );
}
