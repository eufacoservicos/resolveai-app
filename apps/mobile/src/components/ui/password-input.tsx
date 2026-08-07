import { useState } from "react";
import { Pressable, View } from "react-native";
import type { TextInputProps } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { Input } from "@/components/ui/input";

type Props = Omit<TextInputProps, "secureTextEntry"> & { className?: string };

export function PasswordInput({ className, ...props }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="relative justify-center">
      <Input
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        className={`pr-10 ${className ?? ""}`}
        {...props}
      />
      <Pressable
        onPress={() => setShowPassword((prev) => !prev)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-3"
      >
        {showPassword ? (
          <EyeOff size={16} color="#8891a4" />
        ) : (
          <Eye size={16} color="#8891a4" />
        )}
      </Pressable>
    </View>
  );
}
