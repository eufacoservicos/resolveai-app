"use client";

import { Clock } from "lucide-react";
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
  const { isOpen, label } = isProviderOpenNow(hours);

  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const todayDayOfWeek = now.getDay();

  if (hours.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Horário de atendimento
        </h2>
        {label && (
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              isOpen
                ? "bg-emerald-50 text-emerald-600"
                : "bg-gray-100 text-gray-500"
            )}
          >
            {label}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {DAYS_OF_WEEK.map((day) => {
          const dayHours = hours.find((h) => h.day_of_week === day.value);
          const isToday = day.value === todayDayOfWeek;

          return (
            <div
              key={day.value}
              className={cn(
                "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-sm",
                isToday && "bg-primary/5 font-medium"
              )}
            >
              <span className={cn(isToday ? "text-primary" : "text-muted-foreground")}>
                {day.short}
              </span>
              <span
                className={cn(
                  dayHours?.is_closed || !dayHours
                    ? "text-muted-foreground"
                    : "text-foreground"
                )}
              >
                {dayHours
                  ? formatTimeRange(dayHours.open_time, dayHours.close_time, dayHours.is_closed)
                  : "Fechado"}
              </span>
            </div>
          );
        })}
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
      {isOpen ? "Aberto" : "Fechado"}
    </span>
  );
}
