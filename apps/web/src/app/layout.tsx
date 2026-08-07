import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.eufacooservico.com.br"),
  title: {
    default: "Eufaço! - Serviços Locais",
    template: "%s | Eufaço!",
  },
  description:
    "Encontre prestadores de serviços locais na sua cidade. Pintores, eletricistas, encanadores e mais. Baixe o app grátis.",
  icons: {
    icon: "/icon.svg",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "eufaço!",
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    google: "vXyKGAtSH1pkrintgS1RVcP2ARvkp80hXqK4jhvqprU",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090c",
  colorScheme: "dark",
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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${geist.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "eufaço!",
              url: "https://www.eufacooservico.com.br",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
