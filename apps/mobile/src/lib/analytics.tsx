import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "expo-router";
import { PostHogProvider, usePostHog } from "posthog-react-native";

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

// O captureScreens do posthog-react-native monta o tracker como IRMAO dos children,
// entao ele nunca fica dentro do <Stack> do Expo Router — e o useNavigationState do
// @react-navigation/core 7.21+ exige um navigator acima ("Couldn't get the navigation
// state"). Rastreamos a tela na mao: o usePathname do expo-router le de um store
// global (useSyncExternalStore), sem depender de contexto de navigator.
function ScreenTracker() {
  const posthog = usePostHog();
  const pathname = usePathname();

  useEffect(() => {
    posthog.screen(pathname);
  }, [posthog, pathname]);

  return null;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  // O PostHogProvider persiste estado via AsyncStorage, que precisa de `window`.
  // No static rendering da web o bundle roda no Node, entao so montamos no cliente.
  if (!apiKey || typeof window === "undefined") {
    return <>{children}</>;
  }

  return (
    <PostHogProvider
      apiKey={apiKey}
      options={{ host, disabled: __DEV__ }}
      autocapture={{
        captureScreens: false,
        captureTouches: false,
      }}
    >
      <ScreenTracker />
      {children}
    </PostHogProvider>
  );
}
