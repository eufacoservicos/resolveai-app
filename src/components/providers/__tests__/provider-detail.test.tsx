import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProviderDetail } from "../provider-detail";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, ...rest } = props;
    return <img {...rest} />;
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

// Mock server actions
vi.mock("@/app/(main)/provider/[id]/actions", () => ({
  trackWhatsAppClick: vi.fn(),
}));

// Mock next/navigation (used by ReviewCard)
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
  usePathname: () => "/provider/provider-1",
}));

const portfolioImages = [
  { id: "img-1", image_url: "https://example.com/1.jpg", created_at: "2025-01-01" },
  { id: "img-2", image_url: "https://example.com/2.jpg", created_at: "2025-01-02" },
  { id: "img-3", image_url: "https://example.com/3.jpg", created_at: "2025-01-03" },
];

const baseProvider = {
  id: "provider-1",
  description: "Eletricista profissional",
  neighborhood: "Centro",
  city: "São Paulo",
  state: "SP",
  whatsapp: "11999999999",
  instagram: "eletricista_pro",
  is_verified: true,
  user: { full_name: "João Silva", avatar_url: null },
  categories: [{ id: "cat-1", name: "Eletricista", slug: "eletricista" }],
  portfolio: [] as { id: string; image_url: string; created_at: string }[],
  average_rating: 4.5 as number | null,
  review_count: 10,
  business_hours: [] as {
    id: string;
    provider_id: string;
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }[],
};

const manyReviews = Array.from({ length: 8 }, (_, i) => ({
  id: `review-${i}`,
  rating: 5,
  comment: `Comentário ${i}`,
  created_at: "2025-01-01T00:00:00Z",
  client: { full_name: `Cliente ${i}`, avatar_url: null },
  reply: null,
}));

const authUser = { id: "user-1", role: "CLIENT" };

describe("ProviderDetail", () => {
  describe("authenticated user", () => {
    it("shows WhatsApp button", () => {
      render(
        <ProviderDetail
          provider={baseProvider}
          reviews={manyReviews.slice(0, 1)}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );
      const buttons = screen.getAllByRole("button", { name: /chamar no whatsapp/i });
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("opens WhatsApp when authenticated user clicks button", async () => {
      const user = userEvent.setup();
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

      render(
        <ProviderDetail
          provider={baseProvider}
          reviews={[]}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );

      const buttons = screen.getAllByRole("button", { name: /chamar no whatsapp/i });
      await user.click(buttons[0]);

      expect(openSpy).toHaveBeenCalledWith(
        expect.stringContaining("wa.me"),
        "_blank",
        "noopener,noreferrer"
      );
      openSpy.mockRestore();
    });

    it("shows rating stats", () => {
      render(
        <ProviderDetail
          provider={baseProvider}
          reviews={manyReviews.slice(0, 1)}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );
      expect(screen.getAllByText("4.5")).toHaveLength(2);
      expect(screen.getByText("Nota")).toBeInTheDocument();
    });

    it("shows reviews", () => {
      render(
        <ProviderDetail
          provider={baseProvider}
          reviews={manyReviews.slice(0, 1)}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );
      expect(screen.getByText("Comentário 0")).toBeInTheDocument();
    });

    it("shows review button for clients who haven't reviewed", () => {
      render(
        <ProviderDetail
          provider={baseProvider}
          reviews={manyReviews.slice(0, 1)}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );
      const links = screen.getAllByRole("link", { name: /avaliar/i });
      const reviewLink = links.find((l) => l.getAttribute("href")?.includes("/review"));
      expect(reviewLink).toBeDefined();
    });

    it("hides review button when already reviewed", () => {
      render(
        <ProviderDetail
          provider={baseProvider}
          reviews={manyReviews.slice(0, 1)}
          currentUser={authUser}
          alreadyReviewed={true}
        />
      );
      const links = screen.queryAllByRole("link", { name: /avaliar/i });
      const reviewLink = links.find((l) => l.getAttribute("href")?.includes("/review"));
      expect(reviewLink).toBeUndefined();
    });
  });

  describe("unauthenticated user", () => {
    const unauthProvider = {
      ...baseProvider,
      whatsapp: "",
      average_rating: null,
      review_count: 0,
    };

    it("shows login dialog when clicking WhatsApp button", async () => {
      const user = userEvent.setup();
      render(
        <ProviderDetail
          provider={unauthProvider}
          reviews={[]}
          currentUser={null}
          alreadyReviewed={true}
        />
      );
      const buttons = screen.getAllByRole("button", { name: /chamar no whatsapp/i });
      await user.click(buttons[0]);
      expect(screen.getByText("Entre para ver o contato")).toBeInTheDocument();
    });

    it("hides rating values in stats", () => {
      render(
        <ProviderDetail
          provider={unauthProvider}
          reviews={[]}
          currentUser={null}
          alreadyReviewed={true}
        />
      );
      expect(screen.queryByText("4.5")).not.toBeInTheDocument();
      expect(screen.getByText("Nota")).toBeInTheDocument();
    });

    it("shows login prompt instead of reviews", () => {
      render(
        <ProviderDetail
          provider={unauthProvider}
          reviews={[]}
          currentUser={null}
          alreadyReviewed={true}
        />
      );
      expect(screen.getByText("Avaliações disponíveis para cadastrados")).toBeInTheDocument();
    });
  });

  describe("portfolio and lightbox", () => {
    it("shows empty portfolio message", () => {
      render(
        <ProviderDetail
          provider={baseProvider}
          reviews={[]}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );
      expect(screen.getByText("Nenhuma foto no portfólio ainda")).toBeInTheDocument();
    });

    it("renders portfolio images", () => {
      render(
        <ProviderDetail
          provider={{ ...baseProvider, portfolio: portfolioImages }}
          reviews={[]}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );
      expect(screen.getByText("3 fotos")).toBeInTheDocument();
      const images = screen.getAllByAltText("Trabalho do portfólio");
      expect(images).toHaveLength(3);
    });

    it("opens lightbox when clicking a portfolio image", async () => {
      const user = userEvent.setup();
      render(
        <ProviderDetail
          provider={{ ...baseProvider, portfolio: portfolioImages }}
          reviews={[]}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );

      const images = screen.getAllByAltText("Trabalho do portfólio");
      await user.click(images[0]);

      expect(screen.getByAltText("Portfólio")).toBeInTheDocument();
      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("navigates lightbox with prev/next buttons", async () => {
      const user = userEvent.setup();
      render(
        <ProviderDetail
          provider={{ ...baseProvider, portfolio: portfolioImages }}
          reviews={[]}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );

      const images = screen.getAllByAltText("Trabalho do portfólio");
      await user.click(images[0]);

      expect(screen.getByText("1 / 3")).toBeInTheDocument();

      // Click next
      const buttons = screen.getAllByRole("button");
      const nextButton = buttons.find((b) => {
        const svg = b.querySelector(".lucide-chevron-right");
        return svg !== null;
      });
      if (nextButton) {
        await user.click(nextButton);
        expect(screen.getByText("2 / 3")).toBeInTheDocument();
      }
    });

    it("navigates lightbox backwards with prev button", async () => {
      const user = userEvent.setup();
      render(
        <ProviderDetail
          provider={{ ...baseProvider, portfolio: portfolioImages }}
          reviews={[]}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );

      const images = screen.getAllByAltText("Trabalho do portfólio");
      await user.click(images[1]); // start on image 2
      expect(screen.getByText("2 / 3")).toBeInTheDocument();

      const prevButton = screen.getAllByRole("button").find((b) =>
        b.querySelector(".lucide-chevron-left")
      );
      if (prevButton) {
        await user.click(prevButton);
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
      }
    });

    it("closes lightbox when clicking overlay", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ProviderDetail
          provider={{ ...baseProvider, portfolio: portfolioImages }}
          reviews={[]}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );

      const images = screen.getAllByAltText("Trabalho do portfólio");
      await user.click(images[0]);
      expect(screen.getByText("1 / 3")).toBeInTheDocument();

      // Click the overlay background
      const overlay = container.querySelector(".fixed.inset-0");
      if (overlay) {
        await user.click(overlay);
        expect(screen.queryByText("1 / 3")).not.toBeInTheDocument();
      }
    });

    it("closes lightbox when clicking X", async () => {
      const user = userEvent.setup();
      render(
        <ProviderDetail
          provider={{ ...baseProvider, portfolio: portfolioImages }}
          reviews={[]}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );

      const images = screen.getAllByAltText("Trabalho do portfólio");
      await user.click(images[0]);
      expect(screen.getByText("1 / 3")).toBeInTheDocument();

      // Click close (X button)
      const closeButton = screen.getAllByRole("button").find((b) => {
        const svg = b.querySelector(".lucide-x");
        return svg !== null;
      });
      if (closeButton) {
        await user.click(closeButton);
        expect(screen.queryByText("1 / 3")).not.toBeInTheDocument();
      }
    });
  });

  describe("share", () => {
    it("shows share button", () => {
      render(
        <ProviderDetail
          provider={baseProvider}
          reviews={[]}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );
      const shareButtons = screen.getAllByRole("button").filter((b) =>
        b.querySelector(".lucide-share-2")
      );
      expect(shareButtons.length).toBeGreaterThan(0);
    });

    it("copies link when navigator.share is not available", async () => {
      const user = userEvent.setup();
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(navigator, "share", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      render(
        <ProviderDetail
          provider={baseProvider}
          reviews={[]}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );

      const shareButton = screen.getAllByRole("button").find((b) =>
        b.querySelector(".lucide-share-2")
      );
      if (shareButton) {
        await user.click(shareButton);
        expect(writeText).toHaveBeenCalledWith(
          expect.stringContaining("/provider/provider-1")
        );
      }
    });
  });

  describe("reviews pagination", () => {
    it("shows 'ver mais' button when there are more than 5 reviews", () => {
      render(
        <ProviderDetail
          provider={baseProvider}
          reviews={manyReviews}
          currentUser={authUser}
          alreadyReviewed={true}
        />
      );
      expect(screen.getByText(/Ver mais avaliações/)).toBeInTheDocument();
      expect(screen.getByText(/3 restantes/)).toBeInTheDocument();
    });

    it("loads more reviews when button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <ProviderDetail
          provider={baseProvider}
          reviews={manyReviews}
          currentUser={authUser}
          alreadyReviewed={true}
        />
      );

      await user.click(screen.getByText(/Ver mais avaliações/));

      // All 8 reviews should be visible now
      expect(screen.getByText("Comentário 7")).toBeInTheDocument();
      expect(screen.queryByText(/Ver mais avaliações/)).not.toBeInTheDocument();
    });

    it("shows empty state when no reviews", () => {
      render(
        <ProviderDetail
          provider={{ ...baseProvider, review_count: 0 }}
          reviews={[]}
          currentUser={authUser}
          alreadyReviewed={false}
        />
      );
      expect(screen.getByText(/Nenhuma avaliação ainda/)).toBeInTheDocument();
    });
  });

  it("displays provider info correctly", () => {
    render(
      <ProviderDetail
        provider={baseProvider}
        reviews={[]}
        currentUser={authUser}
        alreadyReviewed={false}
      />
    );

    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("Eletricista")).toBeInTheDocument();
    expect(screen.getByText(/Centro, São Paulo, SP/)).toBeInTheDocument();
    expect(screen.getByText("Eletricista profissional")).toBeInTheDocument();
    expect(screen.getByText("@eletricista_pro")).toBeInTheDocument();
  });

  it("shows provider without instagram", () => {
    render(
      <ProviderDetail
        provider={{ ...baseProvider, instagram: null }}
        reviews={[]}
        currentUser={authUser}
        alreadyReviewed={false}
      />
    );
    expect(screen.queryByText(/@eletricista_pro/)).not.toBeInTheDocument();
  });

  it("shows provider without description", () => {
    render(
      <ProviderDetail
        provider={{ ...baseProvider, description: "" }}
        reviews={[]}
        currentUser={authUser}
        alreadyReviewed={false}
      />
    );
    expect(screen.queryByText("Eletricista profissional")).not.toBeInTheDocument();
  });

});
