"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAccountAction } from "./actions";

interface DeleteAccountFormProps {
  userEmail: string;
}

export function DeleteAccountForm({ userEmail }: DeleteAccountFormProps) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmed = confirmation === "EXCLUIR";

  async function handleDelete() {
    setIsDeleting(true);

    const result = await deleteAccountAction();

    if (result.error) {
      toast.error(result.error);
      setIsDeleting(false);
      return;
    }

    toast.success("Conta excluída com sucesso.");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-destructive">
            Esta ação é irreversível
          </p>
          <p className="text-muted-foreground">
            Ao excluir sua conta, todos os seus dados serão permanentemente
            removidos, incluindo:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Dados pessoais (nome, email, foto)</li>
            <li>Perfil de prestador e portfólio</li>
            <li>Avaliações escritas e recebidas</li>
            <li>Favoritos e histórico</li>
            <li>Documentos de verificação</li>
          </ul>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Digite <span className="font-bold text-destructive">EXCLUIR</span>{" "}
          para confirmar
        </label>
        <Input
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="EXCLUIR"
          disabled={isDeleting}
        />
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            className="w-full"
            disabled={!isConfirmed || isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir minha conta
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Sua conta <strong>{userEmail}</strong> sera excluida
              permanentemente. Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Sim, excluir conta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
