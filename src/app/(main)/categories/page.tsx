import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/supabase/queries";
import { CategoryList } from "@/components/providers/category-list";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Categorias - ResolveAí",
  description: "Todas as categorias de serviços disponíveis no ResolveAí.",
};

export default async function CategoriesPage() {
  const supabase = await createClient();
  const categories = await getCategories(supabase);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl font-bold tracking-tight">
          Categorias de Serviço
        </h1>
      </div>

      <CategoryList categories={categories} />
    </div>
  );
}
