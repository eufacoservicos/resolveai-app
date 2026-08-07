import { render } from "@testing-library/react-native";
import { ProviderCard, type ProviderCardData } from "../provider-card";

// O ProviderCard e o componente mais reusado do app e puxa expo-image, icones
// lucide, o helper de horario de funcionamento e o FavoriteButton (que usa
// usePostHog). Este teste garante que a arvore monta de verdade — build
// passando nao prova isso.

const base: ProviderCardData = {
  id: "p1",
  user: { full_name: "Maria Souza", avatar_url: null },
  categories: [
    { id: "c1", name: "Pintor", slug: "pintor" },
    { id: "c2", name: "Gesseiro", slug: "gesseiro" },
  ],
  city: "Sorocaba",
  state: "SP",
  average_rating: 4.8,
  review_count: 12,
};

describe("ProviderCard", () => {
  it("mostra nome e nota", () => {
    const { getByText } = render(<ProviderCard provider={base} />);
    expect(getByText("Maria Souza")).toBeTruthy();
    expect(getByText("4.8")).toBeTruthy();
  });

  it("mostra so a primeira categoria, com contador do restante", () => {
    // O contador fica num Text aninhado, entao o no combinado e "Pintor +1"
    const { getByText, queryByText } = render(<ProviderCard provider={base} />);
    expect(getByText(/Pintor/)).toBeTruthy();
    expect(getByText("+1")).toBeTruthy();
    expect(queryByText(/Gesseiro/)).toBeNull();
  });

  it("nao mostra contador quando ha uma unica categoria", () => {
    const { getByText, queryByText } = render(
      <ProviderCard provider={{ ...base, categories: [base.categories[0]] }} />
    );
    expect(getByText("Pintor")).toBeTruthy();
    expect(queryByText(/^\+/)).toBeNull();
  });

  it("usa iniciais quando nao ha avatar", () => {
    const { getByText } = render(<ProviderCard provider={base} />);
    expect(getByText("MS")).toBeTruthy();
  });

  it("mostra cidade/UF quando nao ha distancia", () => {
    const { getByText } = render(<ProviderCard provider={base} />);
    expect(getByText("Sorocaba/SP")).toBeTruthy();
  });

  it("prefere a distancia sobre a cidade, formatada como no PWA", () => {
    const { getByText, queryByText } = render(
      <ProviderCard provider={{ ...base, distance_km: 0.42 }} />
    );
    expect(getByText("420m")).toBeTruthy();
    expect(queryByText("Sorocaba/SP")).toBeNull();
  });

  it("formata distancias acima de 1km com uma casa decimal", () => {
    const { getByText } = render(
      <ProviderCard provider={{ ...base, distance_km: 3.27 }} />
    );
    expect(getByText("3.3 km")).toBeTruthy();
  });

  it("omite a nota quando o prestador nao tem avaliacoes", () => {
    const { queryByText } = render(
      <ProviderCard provider={{ ...base, average_rating: null }} />
    );
    expect(queryByText("4.8")).toBeNull();
  });

  it("exibe o selo de tipo de prestador", () => {
    const { getByText } = render(
      <ProviderCard provider={{ ...base, provider_type: "company" }} />
    );
    expect(getByText("Empresa")).toBeTruthy();
  });

  it("esconde o botao de favorito quando userId nao e informado", () => {
    const { queryByLabelText } = render(<ProviderCard provider={base} />);
    expect(queryByLabelText("Adicionar aos favoritos")).toBeNull();
  });

  it("mostra o botao de favorito para visitante (userId null)", () => {
    const { getByLabelText } = render(
      <ProviderCard provider={base} userId={null} />
    );
    expect(getByLabelText("Adicionar aos favoritos")).toBeTruthy();
  });
});
