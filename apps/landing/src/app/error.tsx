"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-bg mb-6">
        <span className="text-2xl font-bold text-white">R</span>
      </div>
      <h1 className="text-2xl font-bold text-foreground">Erro inesperado</h1>
      <p className="mt-3 text-sm text-muted-foreground max-w-sm">
        Ocorreu um problema ao carregar a página. Tente novamente.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-lg px-6 font-semibold text-white gradient-bg transition-opacity hover:opacity-90"
      >
        Tentar novamente
      </button>
    </div>
  );
}
