import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner-native";
import { isValidCpf } from "@resolveai/shared/validators/cpf";
import { isValidCnpj } from "@resolveai/shared/validators/cnpj";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DocumentInput,
  getDocumentType,
  type ProviderType,
} from "@/components/ui/document-input";

// Porta do CpfRequiredModal do PWA: bloqueante ate o prestador informar
// CPF/CNPJ valido. O reload do web vira invalidacao da query do perfil.
export function CpfRequiredModal({ profileId }: { profileId: string }) {
  const queryClient = useQueryClient();
  const [providerType, setProviderType] = useState<ProviderType>("individual");
  const [document, setDocument] = useState("");
  const [loading, setLoading] = useState(false);

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

    await queryClient.invalidateQueries({ queryKey: ["pending-cpf"] });
    setLoading(false);
  }

  const rawDigits = document.replace(/\D/g, "").length;
  const minDigits = docType === "cpf" ? 11 : 14;

  return (
    <Dialog open dismissible={false}>
      <DialogHeader>
        <DialogTitle>Dados obrigatórios</DialogTitle>
        <DialogDescription>
          Para continuar usando o eufaço! como prestador, informe seu tipo de
          atuação e documento. Esses dados são obrigatórios para manter seu
          cadastro ativo.
        </DialogDescription>
      </DialogHeader>

      <DocumentInput
        providerType={providerType}
        onProviderTypeChange={setProviderType}
        value={document}
        onChange={setDocument}
      />

      <Button
        onPress={handleSubmit}
        disabled={rawDigits < minDigits}
        loading={loading}
        className="h-11 w-full"
      >
        Salvar e continuar
      </Button>
    </Dialog>
  );
}
