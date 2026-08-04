import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isProviderOpenNow,
  formatTimeRange,
  getDefaultBusinessHours,
  DAYS_OF_WEEK,
} from "../business-hours";
import { BusinessHours } from "@/types/database";

function makeHours(overrides: Partial<BusinessHours> & { day_of_week: number }): BusinessHours {
  return {
    id: "h-1",
    provider_id: "p-1",
    open_time: "08:00",
    close_time: "18:00",
    is_closed: false,
    ...overrides,
  };
}

describe("isProviderOpenNow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty label for empty hours", () => {
    const result = isProviderOpenNow([]);
    expect(result).toEqual({ isOpen: false, label: "" });
  });

  it("returns Fechado when today is marked as closed", () => {
    const now = new Date("2025-06-02T10:00:00"); // Monday = 1
    vi.spyOn(Date.prototype, "toLocaleString").mockReturnValue(now.toString());
    vi.spyOn(Date.prototype, "getDay").mockReturnValue(1);
    vi.spyOn(Date.prototype, "toTimeString").mockReturnValue("10:00:00");

    const hours = [makeHours({ day_of_week: 1, is_closed: true, open_time: null, close_time: null })];
    const result = isProviderOpenNow(hours);
    expect(result.isOpen).toBe(false);
    expect(result.label).toBe("Fechado");
  });

  it("returns Fechado when times are null", () => {
    vi.spyOn(Date.prototype, "getDay").mockReturnValue(1);
    vi.spyOn(Date.prototype, "toTimeString").mockReturnValue("10:00:00");

    const hours = [makeHours({ day_of_week: 1, open_time: null, close_time: null, is_closed: false })];
    const result = isProviderOpenNow(hours);
    expect(result.isOpen).toBe(false);
    expect(result.label).toBe("Fechado");
  });

  it("returns open with close time when within hours", () => {
    vi.spyOn(Date.prototype, "getDay").mockReturnValue(1);
    vi.spyOn(Date.prototype, "toTimeString").mockReturnValue("10:00:00");

    const hours = [makeHours({ day_of_week: 1, open_time: "08:00", close_time: "18:00" })];
    const result = isProviderOpenNow(hours);
    expect(result.isOpen).toBe(true);
    expect(result.label).toContain("18:00");
  });

  it("returns 'Abre às' when before open time", () => {
    vi.spyOn(Date.prototype, "getDay").mockReturnValue(1);
    vi.spyOn(Date.prototype, "toTimeString").mockReturnValue("06:00:00");

    const hours = [makeHours({ day_of_week: 1, open_time: "08:00", close_time: "18:00" })];
    const result = isProviderOpenNow(hours);
    expect(result.isOpen).toBe(false);
    expect(result.label).toContain("Abre às");
    expect(result.label).toContain("08:00");
  });

  it("returns Fechado when after close time", () => {
    vi.spyOn(Date.prototype, "getDay").mockReturnValue(1);
    vi.spyOn(Date.prototype, "toTimeString").mockReturnValue("19:00:00");

    const hours = [makeHours({ day_of_week: 1, open_time: "08:00", close_time: "18:00" })];
    const result = isProviderOpenNow(hours);
    expect(result.isOpen).toBe(false);
    expect(result.label).toBe("Fechado");
  });

  it("returns Fechado when no hours for today", () => {
    vi.spyOn(Date.prototype, "getDay").mockReturnValue(0); // Sunday
    vi.spyOn(Date.prototype, "toTimeString").mockReturnValue("10:00:00");

    const hours = [makeHours({ day_of_week: 1 })]; // Only Monday
    const result = isProviderOpenNow(hours);
    expect(result.isOpen).toBe(false);
    expect(result.label).toBe("Fechado");
  });
});

describe("formatTimeRange", () => {
  it("formats open time range", () => {
    expect(formatTimeRange("08:00:00", "18:00:00", false)).toBe("08:00 - 18:00");
  });

  it("returns Fechado when is_closed is true", () => {
    expect(formatTimeRange("08:00", "18:00", true)).toBe("Fechado");
  });

  it("returns Fechado when times are null", () => {
    expect(formatTimeRange(null, null, false)).toBe("Fechado");
    expect(formatTimeRange("08:00", null, false)).toBe("Fechado");
    expect(formatTimeRange(null, "18:00", false)).toBe("Fechado");
  });
});

describe("getDefaultBusinessHours", () => {
  it("returns 7 entries (one per day)", () => {
    const hours = getDefaultBusinessHours();
    expect(hours).toHaveLength(7);
  });

  it("sets Mon-Fri as 08:00-18:00", () => {
    const hours = getDefaultBusinessHours();
    for (let day = 1; day <= 5; day++) {
      const h = hours.find((x) => x.day_of_week === day)!;
      expect(h.open_time).toBe("08:00");
      expect(h.close_time).toBe("18:00");
      expect(h.is_closed).toBe(false);
    }
  });

  it("sets Saturday and Sunday as closed", () => {
    const hours = getDefaultBusinessHours();
    const sunday = hours.find((x) => x.day_of_week === 0)!;
    const saturday = hours.find((x) => x.day_of_week === 6)!;
    expect(sunday.is_closed).toBe(true);
    expect(sunday.open_time).toBeNull();
    expect(saturday.is_closed).toBe(true);
    expect(saturday.open_time).toBeNull();
  });
});

describe("DAYS_OF_WEEK", () => {
  it("has 7 entries with correct values", () => {
    expect(DAYS_OF_WEEK).toHaveLength(7);
    expect(DAYS_OF_WEEK[0].value).toBe(0);
    expect(DAYS_OF_WEEK[0].label).toBe("Domingo");
    expect(DAYS_OF_WEEK[6].value).toBe(6);
    expect(DAYS_OF_WEEK[6].label).toBe("Sábado");
  });
});
