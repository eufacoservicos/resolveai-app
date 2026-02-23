"use client";

import dynamic from "next/dynamic";

const PwaInstallPrompt = dynamic(
  () =>
    import("@/components/layout/pwa-install-prompt").then(
      (m) => m.PwaInstallPrompt
    ),
  { ssr: false }
);

export function LazyPwaPrompt() {
  return <PwaInstallPrompt />;
}
