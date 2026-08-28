"use client";

import { useState } from "react";
import { Clock, ChevronDown } from "lucide-react";
import { BusinessHours } from "@/types/database";
import {
  DAYS_OF_WEEK,
  isProviderOpenNow,
  formatTimeRange,
} from "@/lib/business-hours";
import { cn } from "@/lib/utils";

interface BusinessHoursDisplayProps {
  hours: BusinessHours[];
}

export function BusinessHoursDisplay({ hours }: BusinessHoursDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const { isOpen, label } = isProviderOpenNow(hours);

  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const todayDayOfWeek = now.getDay();
  const todayHours = hours.find((h) => h.day_of_week === todayDayOfWeek);
  const todayLabel = DAYS_OF_WEEK.find((d) => d.value === todayDayOfWeek);

  if (hours.length === 0) return null;

  const todayTimeText = todayHours
    ? formatTimeRange(todayHours.open_time, todayHours.close_time, todayHours.is_closed)
    : "Fechado";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Collapsed: only today */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left"
      >
        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex flex-1 items-center gap-2 min-w-0 text-sm">
          <span className={cn(
            "inline-flex items-center gap-1.5 font-medium",
            isOpen ? "text-emerald-600" : "text-muted-foreground"
          )}>
            <span className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0",
              isOpen ? "bg-emerald-500" : "bg-gray-400"
            )} />
            {label}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground truncate">
            {todayLabel?.short}: {todayTimeText}
          </span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
          expanded && "rotate-180"
        )} />
      </button>

      {/* Expanded: full week */}
      <div className={cn(
        "grid transition-all duration-200",
        expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="border-t border-border px-3.5 py-2 space-y-0.5">
            {DAYS_OF_WEEK.map((day) => {
              const dayHours = hours.find((h) => h.day_of_week === day.value);
              const isToday = day.value === todayDayOfWeek;

              return (
                <div
                  key={day.value}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2 py-1 text-xs",
                    isToday && "bg-primary/5 font-medium"
                  )}
                >
                  <span className={cn(isToday ? "text-primary" : "text-muted-foreground")}>
                    {day.short}
                  </span>
                  <span className={cn(
                    "tabular-nums",
                    dayHours?.is_closed || !dayHours
                      ? "text-muted-foreground"
                      : "text-foreground"
                  )}>
                    {dayHours
                      ? formatTimeRange(dayHours.open_time, dayHours.close_time, dayHours.is_closed)
                      : "Fechado"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BusinessHoursBadge({ hours }: { hours: BusinessHours[] }) {
  if (hours.length === 0) return null;

  const { isOpen } = isProviderOpenNow(hours);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
        isOpen
          ? "bg-emerald-50 text-emerald-600"
          : "bg-gray-100 text-gray-500"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isOpen ? "bg-emerald-500" : "bg-gray-400"
        )}
      />
      {isOpen ? "Disponível" : "Fechado"}
    </span>
  );
}
