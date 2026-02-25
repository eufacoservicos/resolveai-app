"use client";

import { useEffect, useRef } from "react";
import { trackProfileView } from "@/app/(main)/provider/[id]/actions";

export function TrackView({ providerId }: { providerId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackProfileView(providerId);
  }, [providerId]);

  return null;
}
