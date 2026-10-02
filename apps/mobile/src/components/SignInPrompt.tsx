import { Button, Text, useTheme } from "@eufaco/design-system/native";
import { useRouter } from "expo-router";
import { LogIn } from "lucide-react-native";
import { View } from "react-native";

interface Props {
  title: string;
  description: string;
}

/** Mostrado onde a funcionalidade depende de conta, no lugar de uma tela vazia. */
export function SignInPrompt({ title, description }: Props) {
  const { colors, radii, spacing, layout } = useTheme();
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing[4],
        paddingHorizontal: layout.screenPadding,
      }}
    >
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: radii.lg,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LogIn size={30} color={colors.primaryStrong} />
      </View>

      <View style={{ gap: spacing[2], alignItems: "center" }}>
        <Text variant="h2" style={{ textAlign: "center" }}>
          {title}
        </Text>
        <Text color="textSecondary" style={{ textAlign: "center" }}>
          {description}
        </Text>
      </View>

      <View style={{ alignSelf: "stretch", gap: spacing[2] }}>
        <Button label="Entrar" onPress={() => router.push("/login")} />
        <Button label="Criar conta grátis" variant="secondary" onPress={() => router.push("/register")} />
      </View>
    </View>
  );
}
