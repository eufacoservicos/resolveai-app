"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HomeHero() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearch() {
    const term = searchTerm.trim();
    if (term) {
      router.push(`/search?q=${encodeURIComponent(term)}`);
    } else {
      router.push("/search");
    }
  }

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

      <div
        className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md cursor-text"
        onClick={() => document.getElementById("home-search")?.focus()}
      >
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <input
          id="home-search"
          type="text"
          placeholder="O que você precisa? Ex: eletricista, pintor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
