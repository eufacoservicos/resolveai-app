import { BusinessHours } from "@/types/database";

export const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Segunda-feira", short: "Seg" },
  { value: 2, label: "Terça-feira", short: "Ter" },
  { value: 3, label: "Quarta-feira", short: "Qua" },
  { value: 4, label: "Quinta-feira", short: "Qui" },
  { value: 5, label: "Sexta-feira", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
] as const;

export function isProviderOpenNow(hours: BusinessHours[]): {
  isOpen: boolean;
  label: string;
} {
  if (hours.length === 0) {
    return { isOpen: false, label: "" };
  }

  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const dayOfWeek = now.getDay();
  const currentTime = now.toTimeString().slice(0, 5);

  const todayHours = hours.find((h) => h.day_of_week === dayOfWeek);

  if (!todayHours || todayHours.is_closed) {
    return { isOpen: false, label: "Fechado" };
  }

  if (!todayHours.open_time || !todayHours.close_time) {
    return { isOpen: false, label: "Fechado" };
  }

  const isOpen =
    currentTime >= todayHours.open_time && currentTime < todayHours.close_time;

  if (isOpen) {
    return { isOpen: true, label: `Aberto até ${todayHours.close_time.slice(0, 5)}` };
  }

  if (currentTime < todayHours.open_time) {
    return { isOpen: false, label: `Abre às ${todayHours.open_time.slice(0, 5)}` };
  }

  return { isOpen: false, label: "Fechado" };
}

export function formatTimeRange(
  openTime: string | null,
  closeTime: string | null,
  isClosed: boolean
): string {
  if (isClosed) return "Fechado";
  if (!openTime || !closeTime) return "Fechado";
  return `${openTime.slice(0, 5)} - ${closeTime.slice(0, 5)}`;
}

export function getDefaultBusinessHours(): Omit<BusinessHours, "id" | "provider_id">[] {
  return DAYS_OF_WEEK.map((day) => ({
    day_of_week: day.value,
    open_time: day.value >= 1 && day.value <= 5 ? "08:00" : null,
    close_time: day.value >= 1 && day.value <= 5 ? "18:00" : null,
    is_closed: day.value === 0 || day.value === 6,
  }));
}
