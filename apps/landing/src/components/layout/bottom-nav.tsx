"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, User, LayoutGrid, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  isAuthenticated?: boolean;
}

const authNavItems = [
  { href: "/home", label: "Início", icon: Home },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/favorites", label: "Favoritos", icon: Heart },
  { href: "/profile", label: "Perfil", icon: User },
];

const publicNavItems = [
  { href: "/home", label: "Início", icon: Home },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/categories", label: "Categorias", icon: LayoutGrid },
  { href: "/login", label: "Entrar", icon: LogIn },
];

export function BottomNav({ isAuthenticated = false }: BottomNavProps) {
  const pathname = usePathname();
  const navItems = isAuthenticated ? authNavItems : publicNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/") ||
            (item.href === "/search" && pathname.startsWith("/categories"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon
                className="h-5 w-5"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
