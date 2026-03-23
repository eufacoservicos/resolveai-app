import { describe, it, expect } from "vitest";
import { isValidCnpj, formatCnpj } from "../cnpj";

describe("isValidCnpj", () => {
  it("validates a correct CNPJ", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCnpj("11222333000181")).toBe(true);
    expect(isValidCnpj("11.444.777/0001-61")).toBe(true);
  });

  it("rejects CNPJ with all same digits", () => {
    expect(isValidCnpj("00.000.000/0000-00")).toBe(false);
    expect(isValidCnpj("11.111.111/1111-11")).toBe(false);
    expect(isValidCnpj("22.222.222/2222-22")).toBe(false);
    expect(isValidCnpj("99.999.999/9999-99")).toBe(false);
  });

  it("rejects CNPJ with wrong check digits", () => {
    expect(isValidCnpj("11.222.333/0001-82")).toBe(false);
    expect(isValidCnpj("11.222.333/0001-71")).toBe(false);
  });

  it("rejects CNPJ with wrong length", () => {
    expect(isValidCnpj("11.222.333/0001")).toBe(false);
    expect(isValidCnpj("1122233300018")).toBe(false);
    expect(isValidCnpj("112223330001811")).toBe(false);
    expect(isValidCnpj("")).toBe(false);
  });

  it("handles formatted and unformatted input", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCnpj("11222333000181")).toBe(true);
  });
});

describe("formatCnpj", () => {
  it("formats a full CNPJ", () => {
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("formats partial input progressively", () => {
    expect(formatCnpj("1")).toBe("1");
    expect(formatCnpj("11")).toBe("11");
    expect(formatCnpj("112")).toBe("11.2");
    expect(formatCnpj("11222")).toBe("11.222");
    expect(formatCnpj("112223")).toBe("11.222.3");
    expect(formatCnpj("11222333")).toBe("11.222.333");
    expect(formatCnpj("112223330")).toBe("11.222.333/0");
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("strips non-digit characters before formatting", () => {
    expect(formatCnpj("11.222.333/0001-81")).toBe("11.222.333/0001-81");
  });

  it("returns empty string for empty input", () => {
    expect(formatCnpj("")).toBe("");
  });
});
