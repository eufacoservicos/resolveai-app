import { Text as RNText } from "react-native";
import type { TextProps as RNTextProps } from "react-native";
import { cn } from "@resolveai/shared/cn";

type TextProps = RNTextProps & { className?: string };

export function Text({ className, ...props }: TextProps) {
  return (
    <RNText className={cn("text-base text-foreground", className)} {...props} />
  );
}

export function Muted({ className, ...props }: TextProps) {
  return (
    <RNText
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function Heading({ className, ...props }: TextProps) {
  return (
    <RNText
      className={cn(
        "text-2xl font-extrabold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function Display({ className, ...props }: TextProps) {
  return (
    <RNText
      className={cn(
        "text-[38px] font-black tracking-tighter leading-[40px] text-foreground",
        className
      )}
      {...props}
    />
  );
}
