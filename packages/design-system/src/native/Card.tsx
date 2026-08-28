import { View, type ViewProps } from "react-native";
import { radii, spacing } from "../tokens";
import { useTheme } from "./theme";

export interface CardProps extends ViewProps {
  /** `plain` remove a borda, para blocos já delimitados por cor. */
  variant?: "outlined" | "plain";
  padded?: boolean;
}

export function Card({ variant = "outlined", padded = true, style, ...rest }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderWidth: variant === "outlined" ? 1 : 0,
          borderColor: colors.border,
          padding: padded ? spacing[3] : 0,
        },
        style,
      ]}
      {...rest}
    />
  );
}
