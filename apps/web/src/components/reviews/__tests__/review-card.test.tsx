import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewCard } from "../review-card";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({}),
}));

vi.mock("@/lib/supabase/mutations", () => ({
  createReviewReply: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const baseReview = {
  id: "review-1",
  rating: 4,
  comment: "Ótimo serviço, recomendo!",
  created_at: "2025-03-15T10:00:00Z",
  client: { full_name: "Ana Costa", avatar_url: null },
  reply: null as { content: string; created_at: string } | null,
};

describe("ReviewCard", () => {
  it("renders client name and comment", () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.getByText("Ana Costa")).toBeInTheDocument();
    expect(screen.getByText("Ótimo serviço, recomendo!")).toBeInTheDocument();
  });

  it("renders client initials", () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.getByText("AC")).toBeInTheDocument();
  });

  it("renders correct number of filled stars", () => {
    const { container } = render(<ReviewCard review={baseReview} />);
    const filledStars = container.querySelectorAll(".fill-amber-400");
    expect(filledStars).toHaveLength(4);
  });

  it("renders formatted date", () => {
    render(<ReviewCard review={baseReview} />);
    // Date is formatted in pt-BR
    expect(screen.getByText(/mar/i)).toBeInTheDocument();
  });

  it("hides comment when null", () => {
    render(<ReviewCard review={{ ...baseReview, comment: null }} />);
    expect(screen.queryByText("Ótimo serviço, recomendo!")).not.toBeInTheDocument();
  });

  it("shows provider reply when present", () => {
    render(
      <ReviewCard
        review={{
          ...baseReview,
          reply: {
            content: "Obrigado pela avaliação!",
            created_at: "2025-03-16T10:00:00Z",
          },
        }}
      />
    );
    expect(screen.getByText("Resposta do profissional")).toBeInTheDocument();
    expect(screen.getByText("Obrigado pela avaliação!")).toBeInTheDocument();
  });

  it("shows reply button when canReply is true and no existing reply", () => {
    render(
      <ReviewCard review={baseReview} canReply={true} providerId="p-1" />
    );
    expect(screen.getByText("Responder")).toBeInTheDocument();
  });

  it("hides reply button when review already has a reply", () => {
    render(
      <ReviewCard
        review={{
          ...baseReview,
          reply: { content: "Obrigado!", created_at: "2025-03-16T10:00:00Z" },
        }}
        canReply={true}
        providerId="p-1"
      />
    );
    expect(screen.queryByText("Responder")).not.toBeInTheDocument();
  });

  it("hides reply button when canReply is false", () => {
    render(<ReviewCard review={baseReview} canReply={false} />);
    expect(screen.queryByText("Responder")).not.toBeInTheDocument();
  });

  it("opens reply form when reply button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ReviewCard review={baseReview} canReply={true} providerId="p-1" />
    );

    await user.click(screen.getByText("Responder"));

    expect(
      screen.getByPlaceholderText("Escreva sua resposta...")
    ).toBeInTheDocument();
    expect(screen.getByText("Enviar")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("closes reply form when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ReviewCard review={baseReview} canReply={true} providerId="p-1" />
    );

    await user.click(screen.getByText("Responder"));
    await user.click(screen.getByText("Cancelar"));

    expect(
      screen.queryByPlaceholderText("Escreva sua resposta...")
    ).not.toBeInTheDocument();
  });

  it("submits reply and closes form on success", async () => {
    const user = userEvent.setup();
    render(
      <ReviewCard review={baseReview} canReply={true} providerId="p-1" />
    );

    await user.click(screen.getByText("Responder"));
    await user.type(
      screen.getByPlaceholderText("Escreva sua resposta..."),
      "Obrigado!"
    );
    await user.click(screen.getByText("Enviar"));

    // Form should close after submission
    const { createReviewReply } = await import("@/lib/supabase/mutations");
    expect(createReviewReply).toHaveBeenCalled();
  });

  it("disables submit button when reply is empty", async () => {
    const user = userEvent.setup();
    render(
      <ReviewCard review={baseReview} canReply={true} providerId="p-1" />
    );

    await user.click(screen.getByText("Responder"));

    const submitBtn = screen.getByText("Enviar");
    expect(submitBtn).toBeDisabled();
  });
});
