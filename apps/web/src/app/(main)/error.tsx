"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function MainError({
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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-lg font-bold text-foreground">
        Algo deu errado
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Ocorreu um erro inesperado. Tente novamente ou volte mais tarde.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-semibold text-white gradient-bg transition-opacity hover:opacity-90"
      >
        Tentar novamente
      </button>
    </div>
  );
}
