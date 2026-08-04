import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../button";

describe("Button", () => {
  it("renders the label", () => {
    const { getByText } = render(<Button>Entrar</Button>);
    expect(getByText("Entrar")).toBeTruthy();
  });

  it("fires onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Salvar</Button>);
    fireEvent.press(getByText("Salvar"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress when loading", () => {
    const onPress = jest.fn();
    const { queryByText } = render(
      <Button onPress={onPress} loading>
        Enviando
      </Button>
    );
    expect(queryByText("Enviando")).toBeNull();
    expect(onPress).not.toHaveBeenCalled();
  });
});
