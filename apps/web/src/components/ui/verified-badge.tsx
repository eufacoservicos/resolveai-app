"use client";

import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function VerifiedBadge({
  size = "sm",
  showLabel = false,
  className,
}: VerifiedBadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-blue-500", className)}
      title="Perfil verificado"
    >
      <ShieldCheck className={cn(sizeMap[size], "fill-blue-500 text-white")} />
      {showLabel && (
        <span className="text-xs font-medium text-blue-600">Verificado</span>
      )}
    </span>
  );
}
