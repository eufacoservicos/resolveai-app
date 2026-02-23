import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LazyPwaPrompt } from "@/components/layout/lazy-pwa-prompt";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "eufaço! - Serviços Locais",
  description:
    "Encontre prestadores de serviços locais na sua cidade. Pintores, eletricistas, encanadores e mais.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "eufaço!",
  },
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${geist.variable} font-sans antialiased`}>
        {children}
        <LazyPwaPrompt />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
