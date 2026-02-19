"use client";

import { Loader2 } from "lucide-react";
import { useCategoryPending } from "@/components/providers/category-pending";

export function ProviderListLoading({ children }: { children: React.ReactNode }) {
  const { isPending } = useCategoryPending();

  return (
    <div className="relative space-y-6">
      {children}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
