import type { ReactNode } from "react";
import { PostHogProvider } from "posthog-react-native";

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  if (!apiKey) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider
      apiKey={apiKey}
      options={{ host, disabled: __DEV__ }}
      autocapture={{
        captureScreens: true,
        captureTouches: false,
      }}
    >
      {children}
    </PostHogProvider>
  );
}
