"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { acceptTerms } from "@/lib/supabase/mutations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export function TermsAcceptanceModal({ userId }: { userId: string }) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleAccept() {
    setLoading(true);
    const { error } = await acceptTerms(supabase, userId);
    if (error) {
      setLoading(false);
      return;
    }
    window.location.reload();
  }

  return (
    <Dialog open>
      <DialogContent showCloseButton={false} onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Termos de Uso atualizados</DialogTitle>
          <DialogDescription>
            Para continuar usando o eufaço!, é necessário aceitar os nossos Termos de Uso e Política de Privacidade.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/50 p-4 text-xs text-muted-foreground leading-relaxed space-y-2">
          <p>
            O eufaço! é <strong className="text-foreground">exclusivamente um catálogo digital</strong> de
            prestadores de serviços. Não participamos da negociação, execução ou
            supervisão dos serviços.
          </p>
          <p>
            O contato e a contratação são feitos{" "}
            <strong className="text-foreground">diretamente entre as partes</strong>. A plataforma
            não se responsabiliza por qualquer ocorrência entre cliente e prestador.
          </p>
        </div>

        <label htmlFor="acceptTermsModal" className="flex items-start gap-2.5 cursor-pointer">
          <input
            id="acceptTermsModal"
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-primary shrink-0"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            Li e aceito os{" "}
            <Link href="/terms" target="_blank" className="text-primary hover:underline">Termos de Uso</Link>{" "}
            e a{" "}
            <Link href="/privacy" target="_blank" className="text-primary hover:underline">Política de Privacidade</Link>.
          </span>
        </label>

        <Button
          onClick={handleAccept}
          disabled={!accepted || loading}
          className="w-full h-11 rounded-lg font-semibold gradient-bg"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
