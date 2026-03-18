"use client";

import { useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DAYS_OF_WEEK, getDefaultBusinessHours } from "@/lib/business-hours";
import { BusinessHours } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface BusinessHoursEditorProps {
  providerId: string;
  initialHours: BusinessHours[];
}

interface DayHours {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export function BusinessHoursEditor({
  providerId,
  initialHours,
}: BusinessHoursEditorProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const defaultHours = getDefaultBusinessHours();
  const [hours, setHours] = useState<DayHours[]>(
    DAYS_OF_WEEK.map((day) => {
      const existing = initialHours.find((h) => h.day_of_week === day.value);
      const fallback = defaultHours.find((h) => h.day_of_week === day.value)!;
      return {
        day_of_week: day.value,
        open_time: existing?.open_time?.slice(0, 5) ?? fallback.open_time ?? "08:00",
        close_time: existing?.close_time?.slice(0, 5) ?? fallback.close_time ?? "18:00",
        is_closed: existing ? existing.is_closed : fallback.is_closed,
      };
    })
  );

  function updateDay(dayOfWeek: number, field: keyof DayHours, value: string | boolean) {
    setHours((prev) =>
      prev.map((h) =>
        h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h
      )
    );
  }

  function validate(): string | null {
    for (const h of hours) {
      if (h.is_closed) continue;
      if (!h.open_time || !h.close_time) {
        const dayName = DAYS_OF_WEEK.find((d) => d.value === h.day_of_week)!.label;
        return `${dayName}: preencha os horários de abertura e fechamento.`;
      }
      if (h.close_time <= h.open_time) {
        const dayName = DAYS_OF_WEEK.find((d) => d.value === h.day_of_week)!.label;
        return `${dayName}: o horário de fechamento deve ser depois do de abertura.`;
      }
    }
    return null;
  }

  async function handleSave() {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);

    const rows = hours.map((h) => ({
      provider_id: providerId,
      day_of_week: h.day_of_week,
      open_time: h.is_closed ? null : h.open_time,
      close_time: h.is_closed ? null : h.close_time,
      is_closed: h.is_closed,
    }));

    // Upsert to avoid data loss (uses unique constraint on provider_id + day_of_week)
    const { error } = await supabase
      .from("business_hours")
      .upsert(rows, { onConflict: "provider_id,day_of_week" });

    if (error) {
      toast.error("Erro ao salvar horários.");
    } else {
      toast.success("Horários atualizados!");
    }

    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <Label className="text-base font-semibold">Horário de atendimento</Label>
      </div>

      <div className="space-y-3">
        {hours.map((day) => {
          const dayInfo = DAYS_OF_WEEK.find((d) => d.value === day.day_of_week)!;
          return (
            <div
              key={day.day_of_week}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3"
            >
              <div className="w-12 shrink-0">
                <span className="text-sm font-medium">{dayInfo.short}</span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={!day.is_closed}
                onClick={() => updateDay(day.day_of_week, "is_closed", !day.is_closed)}
                className={cn(
                  "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                  !day.is_closed ? "bg-primary" : "bg-border"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                    !day.is_closed && "translate-x-4"
                  )}
                />
              </button>

              {!day.is_closed ? (
                <div className="grid min-w-0 basis-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:flex-1 sm:basis-auto">
                  <input
                    type="time"
                    value={day.open_time}
                    onChange={(e) =>
                      updateDay(day.day_of_week, "open_time", e.target.value)
                    }
                    className="h-8 w-full min-w-0 rounded-md border border-border px-2 text-sm"
                  />
                  <span className="shrink-0 text-xs text-muted-foreground">às</span>
                  <input
                    type="time"
                    value={day.close_time}
                    onChange={(e) =>
                      updateDay(day.day_of_week, "close_time", e.target.value)
                    }
                    className="h-8 w-full min-w-0 rounded-md border border-border px-2 text-sm"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Fechado</span>
              )}
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="mt-4 w-full h-11 rounded-lg font-semibold gap-2 gradient-bg"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Salvar horários"
        )}
      </Button>
    </div>
  );
}

