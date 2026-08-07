import { render } from "@testing-library/react-native";
import { AuthLogo } from "../auth-logo";

// O logo vem de um .svg compilado pelo react-native-svg-transformer, que so
// roda no Metro. Este teste garante que a arvore monta no Jest (via mock) e
// pega de volta se o mapeamento sumir do jest.config.
describe("AuthLogo", () => {
  it("monta sem erro", () => {
    expect(() => render(<AuthLogo />)).not.toThrow();
  });

  it("renderiza o logo nas dimensoes do PWA (altura 80)", () => {
    const { UNSAFE_root } = render(<AuthLogo />);
    const svg = UNSAFE_root.findByType("SvgMock" as never);
    expect(svg.props.height).toBe(80);
  });
});
