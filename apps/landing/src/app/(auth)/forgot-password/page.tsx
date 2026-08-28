"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Informe seu email.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error("Erro ao enviar email de recuperação.");
    } else {
      setSent(true);
    }

    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Email enviado!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enviamos um link de recuperação para{" "}
          <span className="font-medium text-foreground">{email}</span>.
          Verifique sua caixa de entrada e spam.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg px-6 font-semibold text-white gradient-bg transition-opacity hover:opacity-90"
        >
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Recuperar senha
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Informe seu email para receber o link de recuperação
        </p>
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-lg border-border"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-lg font-semibold gradient-bg"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Enviar link de recuperação"
            )}
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
