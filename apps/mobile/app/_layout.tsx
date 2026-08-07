import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner-native";
import { AuthProvider } from "@/lib/auth-provider";
import { AnalyticsProvider } from "@/lib/analytics";
import { LocationProvider } from "@/lib/location-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AnalyticsProvider>
            <AuthProvider>
              <LocationProvider>
                <StatusBar style="light" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "#08090c" },
                    animation: "fade",
                  }}
                />
                <Toaster
                  position="top-center"
                  richColors
                  theme="dark"
                  toastOptions={{
                    style: {
                      backgroundColor: "#0f1116",
                      borderColor: "#1c2030",
                    },
                  }}
                />
              </LocationProvider>
            </AuthProvider>
          </AnalyticsProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
