import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LazyPwaPrompt } from "@/components/layout/lazy-pwa-prompt";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eufacooservico.com.br"),
  title: {
    default: "eufaço! - Serviços Locais",
    template: "%s | eufaço!",
  },
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
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "eufaço!",
  },
  twitter: {
    card: "summary_large_image",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var ref=document.referrer||"";var twaRef=ref.indexOf("android-app://")===0;var standalone=window.matchMedia("(display-mode: standalone)").matches||window.matchMedia("(display-mode: fullscreen)").matches||window.matchMedia("(display-mode: minimal-ui)").matches||window.navigator.standalone===true;if(twaRef){sessionStorage.setItem("eufaco:twa-launch","1")}var twaSession=sessionStorage.getItem("eufaco:twa-launch")==="1";if(standalone||twaRef||twaSession){document.documentElement.classList.add("app-shell")}}catch(_){}})();`,
          }}
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <Script
          defer
          data-domain="eufacooservico.com.br"
          src="https://devsnorte-plausible.fly.dev/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${geist.variable} font-sans antialiased`} suppressHydrationWarning>
        {/* Splash screen - pure HTML/CSS, renders before JS loads */}
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
            background:
              "radial-gradient(circle at 22% 18%, #e0f2fe 0%, rgba(224,242,254,0) 44%), radial-gradient(circle at 80% 76%, #cffafe 0%, rgba(207,250,254,0) 42%), linear-gradient(160deg, #f0f9ff 0%, #ffffff 54%, #f0fdff 100%)",
            transition: "opacity 0.42s ease-out",
            overflow: "hidden",
            padding: "16px",
          }}
        >
          <div className="splash-blob b1" />
          <div className="splash-blob b2" />
          <div className="splash-blob b3" />

          <section id="splash-card" aria-label="Tela de abertura do aplicativo">
            <div id="splash-logo-wrap">
              <span id="splash-logo-ring" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img id="splash-logo" src="/logo.svg" alt="" width={220} height={80} />
            </div>
            <p id="splash-title">eufaco!</p>
            <p id="splash-sub">Conectando voce aos melhores profissionais da sua regiao.</p>
            <p id="splash-hint">Buscando profissionais verificados...</p>
            <div id="splash-progress">
              <span />
            </div>
            <div id="splash-actions">
              <button id="splash-skip" type="button">
                Entrar agora
              </button>
              <button id="splash-touch" type="button">
                Toque para pular
              </button>
            </div>
          </section>
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html: [
              ".app-shell #splash{display:flex!important}",
              "@media(display-mode:standalone){#splash{display:flex!important}}",
              "#splash.hide{opacity:0;pointer-events:none}",
              "#splash .splash-blob{position:absolute;border-radius:999px;filter:blur(48px);opacity:.55;animation:splash-blob 9s ease-in-out infinite}",
              "#splash .splash-blob.b1{width:260px;height:260px;top:-78px;left:-56px;background:rgba(14,165,233,.28)}",
              "#splash .splash-blob.b2{width:220px;height:220px;right:-46px;bottom:-72px;background:rgba(6,182,212,.28);animation-delay:1.2s}",
              "#splash .splash-blob.b3{width:180px;height:180px;left:58%;top:10%;background:rgba(34,211,238,.22);animation-delay:2.2s}",
              "#splash-card{position:relative;z-index:2;width:min(92vw,420px);padding:28px 22px 22px;border-radius:24px;background:rgba(255,255,255,.78);backdrop-filter:blur(10px);box-shadow:0 20px 50px rgba(2,132,199,.22);border:1px solid rgba(255,255,255,.65);display:flex;flex-direction:column;align-items:center;gap:12px;transform:translateY(14px) scale(.98);opacity:0;animation:splash-card-in .55s ease-out .12s forwards}",
              "#splash-logo-wrap{position:relative;display:grid;place-items:center;width:150px;height:150px}",
              "#splash-logo-ring{position:absolute;inset:8px;border-radius:999px;border:2px solid rgba(14,165,233,.25);animation:splash-spin 6s linear infinite}",
              "#splash-logo-ring::after{content:'';position:absolute;inset:-8px;border-radius:inherit;border:1px dashed rgba(2,132,199,.35);animation:splash-spin-rev 9s linear infinite}",
              "#splash-logo{width:118px;height:auto;filter:drop-shadow(0 8px 14px rgba(14,165,233,.2));animation:splash-logo-float 2.4s ease-in-out infinite}",
              "#splash-title{margin:2px 0 0;font-size:24px;line-height:1.1;font-weight:800;color:#0f172a;text-align:center;letter-spacing:-.02em}",
              "#splash-sub{margin:0;font-size:13px;line-height:1.45;color:#334155;text-align:center;max-width:300px}",
              "#splash-hint{margin:0;font-size:12px;line-height:1.4;color:#0369a1;min-height:17px;text-align:center;transition:opacity .2s ease}",
              "#splash-progress{width:100%;max-width:300px;height:7px;border-radius:999px;background:rgba(14,165,233,.14);overflow:hidden}",
              "#splash-progress>span{display:block;height:100%;width:42%;border-radius:inherit;background:linear-gradient(90deg,#0ea5e9,#06b6d4,#22d3ee);animation:splash-progress 1.2s ease-in-out infinite}",
              "#splash-actions{display:flex;gap:10px;margin-top:4px}",
              "#splash-skip,#splash-touch{border:0;border-radius:999px;padding:9px 14px;font-size:12px;font-weight:700;cursor:pointer;transition:transform .2s ease,opacity .2s ease;background:#0ea5e9;color:#fff;box-shadow:0 8px 18px rgba(14,165,233,.35);opacity:.45;pointer-events:none}",
              "#splash-touch{background:rgba(15,23,42,.08);color:#0f172a;box-shadow:none}",
              "#splash.can-skip #splash-skip,#splash.can-skip #splash-touch{opacity:1;pointer-events:auto}",
              "#splash-skip:active,#splash-touch:active{transform:translateY(1px) scale(.98)}",
              "@keyframes splash-card-in{to{transform:translateY(0) scale(1);opacity:1}}",
              "@keyframes splash-logo-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}",
              "@keyframes splash-spin{to{transform:rotate(360deg)}}",
              "@keyframes splash-spin-rev{to{transform:rotate(-360deg)}}",
              "@keyframes splash-progress{0%{transform:translateX(-130%)}100%{transform:translateX(260%)}}",
              "@keyframes splash-blob{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-14px) scale(1.08)}}",
              "@media(max-width:420px){#splash-card{padding:24px 16px 18px;border-radius:20px}#splash-title{font-size:21px}}",
            ].join(""),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var splash=document.getElementById('splash');if(!splash)return;var skipBtn=document.getElementById('splash-skip');var touchBtn=document.getElementById('splash-touch');var hint=document.getElementById('splash-hint');var minMs=900;var start=Date.now();var hints=['Buscando profissionais verificados...','Carregando categorias e favoritos...','Preparando sua experiencia...'];var hintIndex=0;var hintTimer=null;function hideSplash(){if(!splash||splash.classList.contains('hide'))return;if(hintTimer){clearInterval(hintTimer);}splash.classList.add('hide');setTimeout(function(){if(splash){splash.style.display='none';}},420);}function onSkip(){if(!splash.classList.contains('can-skip'))return;hideSplash();}setTimeout(function(){if(splash){splash.classList.add('can-skip');}},750);if(hint){hint.textContent=hints[0];hintTimer=setInterval(function(){if(!document.body.contains(hint)){clearInterval(hintTimer);return;}hintIndex=(hintIndex+1)%hints.length;hint.style.opacity='0';setTimeout(function(){if(hint){hint.textContent=hints[hintIndex];hint.style.opacity='1';}},120);},1700);}if(skipBtn){skipBtn.addEventListener('click',onSkip);}if(touchBtn){touchBtn.addEventListener('click',onSkip);}splash.addEventListener('click',function(ev){if(ev.target===splash){onSkip();}});requestAnimationFrame(function waitMain(){var root=document.querySelector('main,[data-nextjs-scroll-focus-boundary]');if(root){var elapsed=Date.now()-start;var left=minMs-elapsed;if(left>0){setTimeout(hideSplash,left);}else{hideSplash();}}else{requestAnimationFrame(waitMain);}});})();`,
          }}
        />
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "eufaço!",
              url: "https://eufacooservico.com.br",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://eufacooservico.com.br/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {children}
        <LazyPwaPrompt />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}

