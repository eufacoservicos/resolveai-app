"use client";

import { MapPin } from "lucide-react";

interface LocationBarProps {
  initialLabel?: string;
}

export function LocationBar({ initialLabel }: LocationBarProps) {
  const label = initialLabel;

  if (!label) return null;

  return (
    <div className="bg-primary/5 border-b border-primary/10">
      <div className="mx-auto flex h-8 max-w-5xl items-center justify-center gap-1.5 px-4 text-xs text-primary">
        <MapPin className="h-3 w-3" />
        <span className="font-medium">{label}</span>
      </div>
    </div>
  );
}
