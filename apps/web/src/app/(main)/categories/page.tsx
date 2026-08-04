import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/supabase/queries";
import { CategoryList } from "@/components/providers/category-list";
export const metadata: Metadata = {
  title: "Categorias - eufaço!",
  description: "Todas as categorias de serviços disponíveis no eufaço!.",
};

export default async function CategoriesPage() {
  const supabase = await createClient();
  const categories = await getCategories(supabase);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">
        Categorias de Serviço
      </h1>

      <CategoryList categories={categories} />
    </div>
  );
}
