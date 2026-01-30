"use client";

import { useState, useEffect } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    !!(window.navigator as Navigator & { standalone?: boolean }).standalone
  );
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosBanner, setShowIosBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [standalone, setStandalone] = useState(true); // default true to avoid flash

  useEffect(() => {
    // Already installed as PWA
    if (isInStandaloneMode()) {
      setStandalone(true);
      return;
    }
    setStandalone(false);

    // Dismissed this session
    if (sessionStorage.getItem("pwa-install-dismissed")) {
      setDismissed(true);
      return;
    }

    // iOS: no beforeinstallprompt, show manual instructions
    if (isIos()) {
      setShowIosBanner(true);
      return;
    }

    // Android/Chrome: capture beforeinstallprompt
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  // Nothing to show
  if (standalone || dismissed) return null;
  if (!deferredPrompt && !showIosBanner) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    setDeferredPrompt(null);
    setShowIosBanner(false);
    sessionStorage.setItem("pwa-install-dismissed", "1");
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:w-80">
      <div className="rounded-xl border border-border bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-bg">
            <Download className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-sm">
              Instalar ResolveAí
            </h4>
            {showIosBanner ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Toque em{" "}
                <Share className="inline h-3.5 w-3.5 -mt-0.5 text-primary" />{" "}
                e depois <strong>&quot;Adicionar à Tela Inicial&quot;</strong>
              </p>
            ) : (
              <>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Acesse mais rápido direto da tela inicial
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    className="h-8 rounded-lg gradient-bg text-xs font-semibold"
                    onClick={handleInstall}
                  >
                    Instalar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg text-xs text-muted-foreground"
                    onClick={handleDismiss}
                  >
                    Agora não
                  </Button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
