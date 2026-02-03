"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";

interface CategoryFilterProps {
  categories: { id: string; name: string; slug: string }[];
  activeSlug?: string;
  limit?: number;
}

export function CategoryFilter({ categories, activeSlug, limit }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const displayed = limit ? categories.slice(0, limit) : categories;
  const hasMore = limit ? categories.length > limit : false;

  function handleClick(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === activeSlug) {
      params.delete("categoria");
    } else {
      params.set("categoria", slug);
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categorias</h2>
        {hasMore && (
          <Link
            href="/categories"
            className="flex items-center gap-1 text-sm font-medium text-primary"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {displayed.map((cat) => {
          const isActive = cat.slug === activeSlug;
          const Icon = getCategoryIcon(cat.slug);

          return (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.slug)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                isActive
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  isActive ? "bg-primary/10" : "bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-center leading-tight">{cat.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
