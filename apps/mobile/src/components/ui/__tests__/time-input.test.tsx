import { render, fireEvent } from "@testing-library/react-native";
import { useState } from "react";
import { TimeInput, normalizeTime } from "../time-input";

// O TimeInput substitui o <input type="time"> do PWA. A mascara e a
// normalizacao guardam o formato HH:MM que o banco espera.

describe("normalizeTime", () => {
  it("mantem um horario ja valido", () => {
    expect(normalizeTime("08:30")).toBe("08:30");
  });

  it("le ate dois digitos como hora", () => {
    expect(normalizeTime("8")).toBe("08:00");
    expect(normalizeTime("08")).toBe("08:00");
    expect(normalizeTime("18")).toBe("18:00");
  });

  it("completa os minutos a direita", () => {
    expect(normalizeTime("083")).toBe("08:30");
    expect(normalizeTime("0845")).toBe("08:45");
  });

  it("limita hora e minuto ao maximo valido", () => {
    expect(normalizeTime("99:99")).toBe("23:59");
    expect(normalizeTime("24:00")).toBe("23:00");
    expect(normalizeTime("12:75")).toBe("12:59");
  });

  it("ignora caracteres nao numericos", () => {
    expect(normalizeTime("ab:cd")).toBe("00:00");
  });
});

function Harness({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return <TimeInput value={value} onChangeText={setValue} />;
}

describe("TimeInput", () => {
  it("insere os dois pontos enquanto digita", () => {
    const { getByPlaceholderText } = render(<Harness />);
    const input = getByPlaceholderText("00:00");

    fireEvent.changeText(input, "0830");
    expect(input.props.value).toBe("08:30");
  });

  it("nao adiciona os dois pontos antes de dois digitos", () => {
    const { getByPlaceholderText } = render(<Harness />);
    const input = getByPlaceholderText("00:00");

    fireEvent.changeText(input, "0");
    expect(input.props.value).toBe("0");
  });

  it("descarta digitos alem de quatro", () => {
    const { getByPlaceholderText } = render(<Harness />);
    const input = getByPlaceholderText("00:00");

    fireEvent.changeText(input, "0830999");
    expect(input.props.value).toBe("08:30");
  });

  it("normaliza ao sair do campo", () => {
    const { getByPlaceholderText } = render(<Harness initial="9" />);
    const input = getByPlaceholderText("00:00");

    fireEvent(input, "blur");
    expect(input.props.value).toBe("09:00");
  });
});
