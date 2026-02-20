"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Check, X, ChevronDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryMultiSelectProps {
  categories: Category[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onAddCustom?: (name: string) => Promise<Category | null>;
  placeholder?: string;
}

export function CategoryMultiSelect({
  categories,
  selected,
  onChange,
  onAddCustom,
  placeholder = "Buscar categorias...",
}: CategoryMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = search
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : categories;

  const selectedCats = categories.filter((c) => selected.includes(c.id));

  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  }

  function remove(id: string) {
    onChange(selected.filter((s) => s !== id));
  }

  async function handleAddCustom() {
    if (!onAddCustom || !search.trim() || search.trim().length < 2) return;
    setAddingCustom(true);
    const newCat = await onAddCustom(search.trim());
    if (newCat) {
      toggle(newCat.id);
      setSearch("");
    }
    setAddingCustom(false);
  }

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2.5 text-sm transition-colors",
          open ? "border-primary" : "border-border"
        )}
      >
        <span className="text-muted-foreground">
          {selected.length === 0
            ? "Selecionar categorias"
            : `${selected.length} selecionada${selected.length > 1 ? "s" : ""}`}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Selected tags */}
      {selectedCats.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedCats.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-xs font-medium text-primary"
            >
              {cat.name}
              <button
                type="button"
                onClick={() => remove(cat.id)}
                className="ml-0.5 rounded-full hover:bg-primary/10"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-white shadow-lg">
          {/* Search input */}
          <div className="relative border-b border-border p-2">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="h-9 w-full rounded-md border border-border bg-muted/50 pl-9 pr-3 text-sm outline-none focus:border-primary"
              autoFocus
            />
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              onAddCustom && search.trim().length >= 2 ? (
                <button
                  type="button"
                  onClick={handleAddCustom}
                  disabled={addingCustom}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors"
                >
                  {addingCustom ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Adicionar &quot;{search.trim()}&quot;
                </button>
              ) : (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                  Nenhuma categoria encontrada
                </p>
              )
            ) : (
              filtered.map((cat) => {
                const isSelected = selected.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggle(cat.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      isSelected
                        ? "bg-primary/5 text-primary font-medium"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-border"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    {cat.name}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
