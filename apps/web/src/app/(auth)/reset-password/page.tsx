"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      toast.error("Erro ao redefinir senha. O link pode ter expirado.");
    } else {
      toast.success("Senha redefinida com sucesso!");
      router.push("/home");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Nova senha
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Defina sua nova senha para acessar o eufaço!
        </p>
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">
              Nova senha
            </Label>
            <PasswordInput
              id="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg border-border"
              minLength={6}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar nova senha
            </Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 rounded-lg border-border"
              minLength={6}
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
              "Redefinir senha"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
