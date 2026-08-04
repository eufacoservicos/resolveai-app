import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";
import { DeleteAccountForm } from "./delete-account-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function DeleteAccountPage() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/80"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">Excluir conta</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Aqui você pode solicitar a exclusão permanente da sua conta e de todos
        os dados associados no <strong>eufaco!</strong>. Após a exclusão, seus
        dados serão removidos em até 30 dias.
      </p>

      <DeleteAccountForm userEmail={user.email} />
    </div>
  );
}
