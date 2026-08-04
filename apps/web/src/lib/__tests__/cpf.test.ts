import { describe, it, expect } from "vitest";
import { isValidCpf, formatCpf } from "../cpf";

describe("isValidCpf", () => {
  it("validates a correct CPF", () => {
    // Known valid CPFs (generated for testing)
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("52998224725")).toBe(true);
    expect(isValidCpf("111.444.777-35")).toBe(true);
  });

  it("rejects CPF with all same digits", () => {
    expect(isValidCpf("000.000.000-00")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("222.222.222-22")).toBe(false);
    expect(isValidCpf("999.999.999-99")).toBe(false);
  });

  it("rejects CPF with wrong check digits", () => {
    expect(isValidCpf("529.982.247-26")).toBe(false); // last digit wrong
    expect(isValidCpf("529.982.247-15")).toBe(false); // second-to-last wrong
  });

  it("rejects CPF with wrong length", () => {
    expect(isValidCpf("123.456.789")).toBe(false);
    expect(isValidCpf("1234567890")).toBe(false);
    expect(isValidCpf("123456789012")).toBe(false);
    expect(isValidCpf("")).toBe(false);
  });

  it("handles formatted and unformatted input", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("52998224725")).toBe(true);
  });
});

describe("formatCpf", () => {
  it("formats a full CPF", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
  });

  it("formats partial input progressively", () => {
    expect(formatCpf("5")).toBe("5");
    expect(formatCpf("529")).toBe("529");
    expect(formatCpf("5299")).toBe("529.9");
    expect(formatCpf("529982")).toBe("529.982");
    expect(formatCpf("5299822")).toBe("529.982.2");
    expect(formatCpf("529982247")).toBe("529.982.247");
    expect(formatCpf("5299822472")).toBe("529.982.247-2");
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
  });

  it("strips non-digit characters before formatting", () => {
    expect(formatCpf("529.982.247-25")).toBe("529.982.247-25");
    expect(formatCpf("abc529def982ghi247jkl25")).toBe("529.982.247-25");
  });

  it("returns empty string for empty input", () => {
    expect(formatCpf("")).toBe("");
  });
});
