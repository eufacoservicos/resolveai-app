import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  BusinessHoursDisplay,
  BusinessHoursBadge,
} from "../business-hours-display";
import { BusinessHours } from "@/types/database";

const weekdayHours: BusinessHours[] = Array.from({ length: 7 }, (_, i) => ({
  id: `h-${i}`,
  provider_id: "p-1",
  day_of_week: i,
  open_time: i >= 1 && i <= 5 ? "08:00" : null,
  close_time: i >= 1 && i <= 5 ? "18:00" : null,
  is_closed: i === 0 || i === 6,
}));

describe("BusinessHoursDisplay", () => {
  it("returns null for empty hours", () => {
    const { container } = render(<BusinessHoursDisplay hours={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders collapsed view with today info", () => {
    render(<BusinessHoursDisplay hours={weekdayHours} />);
    // Should show a button to expand
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("expands to show full week when clicked", async () => {
    const user = userEvent.setup();
    render(<BusinessHoursDisplay hours={weekdayHours} />);

    await user.click(screen.getByRole("button"));

    // Should show day labels
    expect(screen.getByText("Dom")).toBeInTheDocument();
    expect(screen.getByText("Seg")).toBeInTheDocument();
    expect(screen.getByText("Sáb")).toBeInTheDocument();
  });

  it("shows Fechado for closed days in expanded view", async () => {
    const user = userEvent.setup();
    render(<BusinessHoursDisplay hours={weekdayHours} />);

    await user.click(screen.getByRole("button"));

    const fechadoElements = screen.getAllByText("Fechado");
    expect(fechadoElements.length).toBeGreaterThan(0);
  });

  it("shows time ranges for open days in expanded view", async () => {
    const user = userEvent.setup();
    render(<BusinessHoursDisplay hours={weekdayHours} />);

    await user.click(screen.getByRole("button"));

    const timeRanges = screen.getAllByText("08:00 - 18:00");
    expect(timeRanges.length).toBe(5); // Mon-Fri
  });
});

describe("BusinessHoursBadge", () => {
  it("returns null for empty hours", () => {
    const { container } = render(<BusinessHoursBadge hours={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders badge with availability status", () => {
    render(<BusinessHoursBadge hours={weekdayHours} />);
    // Should show either "Disponível" or "Fechado"
    const text = screen.getByText(/Disponível|Fechado/);
    expect(text).toBeInTheDocument();
  });
});
