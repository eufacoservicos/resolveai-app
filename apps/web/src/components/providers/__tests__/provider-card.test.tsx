import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProviderCard } from "../provider-card";

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
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Mock FavoriteButton
vi.mock("@/components/providers/favorite-button", () => ({
  FavoriteButton: () => <button>Fav</button>,
}));

const baseProvider = {
  id: "provider-1",
  user: { full_name: "Maria Souza", avatar_url: null },
  categories: [{ id: "cat-1", name: "Diarista", slug: "diarista" }],
  city: "Rio de Janeiro",
  state: "RJ",
  average_rating: 4.8 as number | null,
  review_count: 15,
};

describe("ProviderCard", () => {
  it("renders provider name and category", () => {
    const { container } = render(<ProviderCard provider={baseProvider} />);
    expect(container.querySelector("h3")!.textContent).toBe("Maria Souza");
    expect(screen.getByText("Diarista")).toBeInTheDocument();
  });

  it("shows rating when available", () => {
    const { container } = render(<ProviderCard provider={baseProvider} />);
    const ratingEl = container.querySelector(".fill-amber-400");
    expect(ratingEl).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });

  it("hides rating when null", () => {
    render(
      <ProviderCard provider={{ ...baseProvider, average_rating: null }} />
    );
    expect(screen.queryByText("4.8")).not.toBeInTheDocument();
  });

  it("links to provider profile", () => {
    const { container } = render(<ProviderCard provider={baseProvider} />);
    const link = container.querySelector("a");
    expect(link).toHaveAttribute("href", "/provider/provider-1");
  });

  it("shows location", () => {
    render(<ProviderCard provider={baseProvider} />);
    expect(screen.getByText("Rio de Janeiro/RJ")).toBeInTheDocument();
  });

  it("shows distance when available", () => {
    render(
      <ProviderCard provider={{ ...baseProvider, distance_km: 2.3 }} />
    );
    expect(screen.getByText("2.3 km")).toBeInTheDocument();
  });

  it("shows distance in meters when less than 1km", () => {
    render(
      <ProviderCard provider={{ ...baseProvider, distance_km: 0.5 }} />
    );
    expect(screen.getByText("500m")).toBeInTheDocument();
  });

  it("shows multiple categories count", () => {
    render(
      <ProviderCard
        provider={{
          ...baseProvider,
          categories: [
            { id: "1", name: "Diarista", slug: "diarista" },
            { id: "2", name: "Faxineira", slug: "faxineira" },
          ],
        }}
      />
    );
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("shows initials when no avatar", () => {
    render(<ProviderCard provider={baseProvider} />);
    expect(screen.getByText("MS")).toBeInTheDocument();
  });

  it("shows favorite button when userId is provided", () => {
    render(
      <ProviderCard
        provider={baseProvider}
        userId="user-1"
        isFavorited={false}
      />
    );
    expect(screen.getByText("Fav")).toBeInTheDocument();
  });

  it("hides favorite button when userId is undefined", () => {
    render(<ProviderCard provider={baseProvider} />);
    expect(screen.queryByText("Fav")).not.toBeInTheDocument();
  });
});
