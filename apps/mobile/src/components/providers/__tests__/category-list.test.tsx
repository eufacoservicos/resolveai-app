import { render, fireEvent } from "@testing-library/react-native";
import { CategoryList } from "../category-list";

// O agrupamento por CATEGORY_GROUPS e a busca sao logica de verdade e
// silenciosa: uma categoria fora de grupo deve cair em "Outros", nunca sumir.

const categories = [
  { id: "1", name: "Pintor", slug: "pintor" },
  { id: "2", name: "Pedreiro", slug: "pedreiro" },
  { id: "3", name: "Eletricista", slug: "eletricista" },
  { id: "4", name: "Serviço Inventado", slug: "slug-que-nao-existe" },
];

describe("CategoryList", () => {
  it("agrupa categorias sob o grupo correspondente", () => {
    const { getByText } = render(<CategoryList categories={categories} />);
    expect(getByText("Construção e Reformas")).toBeTruthy();
    expect(getByText("Pintor")).toBeTruthy();
    expect(getByText("Pedreiro")).toBeTruthy();
  });

  it("joga categorias sem grupo em 'Outros' em vez de descarta-las", () => {
    const { getByText } = render(<CategoryList categories={categories} />);
    expect(getByText("Outros")).toBeTruthy();
    expect(getByText("Serviço Inventado")).toBeTruthy();
  });

  it("conta as categorias disponiveis", () => {
    const { getByText } = render(<CategoryList categories={categories} />);
    expect(getByText("4 categorias disponíveis")).toBeTruthy();
  });

  it("usa singular quando ha uma unica categoria", () => {
    const { getByText } = render(
      <CategoryList categories={[categories[0]]} />
    );
    expect(getByText("1 categoria disponível")).toBeTruthy();
  });

  it("filtra pela busca e atualiza a contagem", () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <CategoryList categories={categories} />
    );
    fireEvent.changeText(getByPlaceholderText("Buscar categoria..."), "pint");
    expect(getByText("1 categoria encontrada")).toBeTruthy();
    expect(getByText("Pintor")).toBeTruthy();
    expect(queryByText("Eletricista")).toBeNull();
  });

  it("mostra estado vazio quando a busca nao acha nada", () => {
    const { getByPlaceholderText, getByText } = render(
      <CategoryList categories={categories} />
    );
    fireEvent.changeText(getByPlaceholderText("Buscar categoria..."), "zzzz");
    expect(getByText("Nenhuma categoria encontrada")).toBeTruthy();
  });
});
