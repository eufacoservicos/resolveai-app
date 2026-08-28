"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isValidCpf } from "@/lib/cpf";
import { isValidCnpj } from "@/lib/cnpj";
import { DocumentInput, getDocumentType, type ProviderType } from "@/components/ui/document-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CpfRequiredModal({ profileId }: { profileId: string }) {
  const [providerType, setProviderType] = useState<ProviderType>("individual");
  const [document, setDocument] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const docType = getDocumentType(providerType);
  const docLabel = docType.toUpperCase();

  async function handleSubmit() {
    const rawDoc = document.replace(/\D/g, "");
    const isValid = docType === "cpf" ? isValidCpf(rawDoc) : isValidCnpj(rawDoc);
    if (!rawDoc || !isValid) {
      toast.error(`Informe um ${docLabel} válido.`);
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("provider_profiles")
      .update({ cpf: rawDoc, provider_type: providerType })
      .eq("id", profileId);

    if (error) {
      if (error.code === "23505") {
        toast.error(`Este ${docLabel} já está cadastrado por outro prestador.`);
      } else {
        toast.error(`Erro ao salvar ${docLabel}. Tente novamente.`);
      }
      setLoading(false);
      return;
    }

    window.location.reload();
  }

  const rawDigits = document.replace(/\D/g, "").length;
  const minDigits = docType === "cpf" ? 11 : 14;

  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Dados obrigatórios</DialogTitle>
          <DialogDescription>
            Para continuar usando o eufaço! como prestador, informe
            seu tipo de atuação e documento. Esses dados são obrigatórios
            para manter seu cadastro ativo.
          </DialogDescription>
        </DialogHeader>

        <DocumentInput
          providerType={providerType}
          onProviderTypeChange={setProviderType}
          value={document}
          onChange={setDocument}
        />

        <Button
          onClick={handleSubmit}
          disabled={loading || rawDigits < minDigits}
          className="w-full h-11 rounded-lg font-semibold gradient-bg"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Salvar e continuar"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
