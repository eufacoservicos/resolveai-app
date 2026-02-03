"use client";

import { Search } from "lucide-react";
import Link from "next/link";

export function HomeHero() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Encontre o profissional{" "}
          <span className="text-primary">ideal</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Conecte-se com os melhores prestadores da sua região
        </p>
      </div>

      <Link href="/search" className="block">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-muted-foreground shadow-sm transition-shadow hover:shadow-md">
          <Search className="h-5 w-5" />
          <span className="text-sm">O que você precisa?</span>
        </div>
      </Link>
    </div>
  );
}
