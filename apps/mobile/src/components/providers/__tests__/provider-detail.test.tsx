import { render } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SafeAreaProvider,
  type Metrics,
} from "react-native-safe-area-context";
import { ProviderDetail, type ProviderDetailData } from "../provider-detail";
import type { ReviewData } from "@/components/reviews/review-card";

// O CTA fixo posiciona-se acima da tab bar usando useSafeAreaInsets, que exige
// um SafeAreaProvider — no app ele vem do layout raiz.
const SAFE_AREA_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

// O PWA esconde whatsapp/nota/avaliacoes de visitantes. Esse gating e a regra
// mais facil de regredir num port, entao fica coberta aqui.

function renderDetail(props: Parameters<typeof ProviderDetail>[0]) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <QueryClientProvider client={client}>
        <ProviderDetail {...props} />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const provider: ProviderDetailData = {
  id: "p1",
  description: "Pinturas residenciais e comerciais.",
  neighborhood: "Centro",
  city: "Sorocaba",
  state: "SP",
  whatsapp: "15999999999",
  provider_type: "individual",
  user: { full_name: "Maria Souza", avatar_url: null },
  categories: [{ id: "c1", name: "Pintor", slug: "pintor" }],
  portfolio: [],
  average_rating: 4.8,
  review_count: 2,
};

const reviews: ReviewData[] = [
  {
    id: "r1",
    rating: 5,
    comment: "Trabalho impecável",
    created_at: "2026-01-10T12:00:00Z",
    client: { full_name: "João Lima", avatar_url: null },
  },
];

describe("ProviderDetail", () => {
  it("mostra o perfil e a descricao", () => {
    const { getByText } = renderDetail({
      provider,
      reviews,
      currentUser: { id: "u1", role: "CLIENT" },
      alreadyReviewed: false,
    });
    expect(getByText("Maria Souza")).toBeTruthy();
    expect(getByText("Pinturas residenciais e comerciais.")).toBeTruthy();
    expect(getByText("Centro, Sorocaba, SP")).toBeTruthy();
  });

  it("bloqueia avaliacoes para visitante", () => {
    const { getByText, queryByText } = renderDetail({
      // Como na rota: visitante recebe os campos ja zerados
      provider: { ...provider, whatsapp: null, average_rating: null, review_count: 0 },
      reviews: [],
      currentUser: null,
      alreadyReviewed: true,
    });
    expect(getByText("Avaliações disponíveis para cadastrados")).toBeTruthy();
    expect(getByText("Criar conta grátis")).toBeTruthy();
    expect(queryByText("Trabalho impecável")).toBeNull();
  });

  it("mostra as avaliacoes para usuario logado", () => {
    const { getByText } = renderDetail({
      provider,
      reviews,
      currentUser: { id: "u1", role: "CLIENT" },
      alreadyReviewed: false,
    });
    expect(getByText("Trabalho impecável")).toBeTruthy();
    expect(getByText("João Lima")).toBeTruthy();
  });

  it("oferece o CTA de avaliar para cliente que ainda nao avaliou", () => {
    const { getByText } = renderDetail({
      provider,
      reviews,
      currentUser: { id: "u1", role: "CLIENT" },
      alreadyReviewed: false,
    });
    expect(getByText("Avaliar")).toBeTruthy();
  });

  it("esconde o CTA de avaliar quando ja avaliou", () => {
    const { queryByText } = renderDetail({
      provider,
      reviews,
      currentUser: { id: "u1", role: "CLIENT" },
      alreadyReviewed: true,
    });
    expect(queryByText("Avaliar")).toBeNull();
  });

  it("esconde o CTA de avaliar para prestador", () => {
    const { queryByText } = renderDetail({
      provider,
      reviews,
      currentUser: { id: "u1", role: "PROVIDER" },
      alreadyReviewed: false,
    });
    expect(queryByText("Avaliar")).toBeNull();
  });

  it("mostra o estado vazio do portfolio", () => {
    const { getByText } = renderDetail({
      provider,
      reviews,
      currentUser: { id: "u1", role: "CLIENT" },
      alreadyReviewed: false,
    });
    expect(getByText("Nenhuma foto no portfólio ainda")).toBeTruthy();
  });

  it("sempre oferece o botao de WhatsApp", () => {
    const { getByText } = renderDetail({
      provider,
      reviews: [],
      currentUser: null,
      alreadyReviewed: true,
    });
    expect(getByText("Chamar no WhatsApp")).toBeTruthy();
  });
});
