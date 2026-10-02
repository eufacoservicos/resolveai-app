import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import {
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { ThemeProvider, useTheme } from "@eufaco/design-system/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "@/components/Toast";
import { LocationProvider } from "@/lib/location";
import { PushSync } from "@/lib/push-sync";
import { SessionProvider } from "@/lib/session";
import { ThemePreferenceProvider, useThemePreference } from "@/lib/theme-preference";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // As chaves viram o nome da família em runtime e precisam bater
  // com nativeFonts do design system.
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemePreferenceProvider>
        <ThemedApp />
      </ThemePreferenceProvider>
    </SafeAreaProvider>
  );
}

/** Separado do root para poder ler a preferência antes de montar o tema. */
function ThemedApp() {
  const { scheme } = useThemePreference();
  return (
    <ThemeProvider scheme={scheme}>
      <SessionProvider>
        <LocationProvider>
          <ToastProvider>
            <PushSync />
            <RootNavigator />
          </ToastProvider>
        </LocationProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { colors, scheme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </>
  );
}
