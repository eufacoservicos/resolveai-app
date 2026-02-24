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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${geist.variable} font-sans antialiased`} suppressHydrationWarning>
        {/* Splash screen — pure HTML/CSS, renders before JS loads */}
        <div
          id="splash"
          suppressHydrationWarning
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "none",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #ecfeff 100%)",
            transition: "opacity 0.4s ease-out",
            overflow: "hidden",
          }}
        >
          {/* Gradient orbs */}
          <div style={{ position: "absolute", top: "-80px", right: "-80px", width: 300, height: 300, borderRadius: "50%", background: "rgba(14,165,233,0.06)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: 250, height: 250, borderRadius: "50%", background: "rgba(6,182,212,0.05)", filter: "blur(60px)" }} />

          {/* Floating icons (pure SVG, no JS needed) */}
          {/* Zap */}
          <svg style={{ position: "absolute", top: "18%", left: "10%", opacity: 0.07, animation: "splash-float 6s ease-in-out infinite" }} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          {/* Paintbrush */}
          <svg style={{ position: "absolute", top: "28%", right: "12%", opacity: 0.06, animation: "splash-float 8s ease-in-out 1s infinite" }} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/></svg>
          {/* Wrench */}
          <svg style={{ position: "absolute", bottom: "22%", left: "14%", opacity: 0.06, animation: "splash-float 7s ease-in-out 2s infinite", transform: "rotate(0deg)" }} width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          {/* Scissors */}
          <svg style={{ position: "absolute", top: "60%", right: "10%", opacity: 0.05, animation: "splash-float 6s ease-in-out 3s infinite" }} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></svg>
          {/* Droplets */}
          <svg style={{ position: "absolute", top: "42%", left: "6%", opacity: 0.05, animation: "splash-float 7s ease-in-out 1.5s infinite" }} width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>

          {/* Logo with entrance animation */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt=""
            width={180}
            height={66}
            style={{
              height: 66,
              width: "auto",
              position: "relative",
              animation: "splash-logo 0.6s ease-out both, splash-pulse 2s ease-in-out 0.6s infinite",
            }}
          />
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html: [
              "@media(display-mode:standalone){#splash{display:flex!important}}",
              "@keyframes splash-logo{from{opacity:0;transform:translateY(16px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}",
              "@keyframes splash-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.04);opacity:0.85}}",
              "@keyframes splash-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}",
              "#splash.hide{opacity:0;pointer-events:none}",
            ].join(""),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `requestAnimationFrame(function c(){var m=document.querySelector('main,[data-nextjs-scroll-focus-boundary]');if(m){var s=document.getElementById('splash');if(s){s.classList.add('hide');setTimeout(function(){s.style.display='none'},400)}}else{requestAnimationFrame(c)}})`,
          }}
        />
        {children}
        <LazyPwaPrompt />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
