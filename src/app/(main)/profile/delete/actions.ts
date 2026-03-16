"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/queries";

export async function deleteAccountAction() {
  const supabase = await createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Delete storage files (avatars, portfolio, verification docs)
    const buckets = ["avatars", "portfolio", "verification-documents"];
    for (const bucket of buckets) {
      const { data: files } = await adminClient.storage
        .from(bucket)
        .list(user.id);

      if (files && files.length > 0) {
        await adminClient.storage
          .from(bucket)
          .remove(files.map((f) => `${user.id}/${f.name}`));
      }
    }

    // 2. Delete auth user (cascades to all related data via foreign keys)
    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return { error: "Erro ao excluir conta. Tente novamente." };
    }

    // 3. Sign out current session
    await supabase.auth.signOut();

    return { success: true };
  } catch {
    return { error: "Erro inesperado. Tente novamente mais tarde." };
  }
}
