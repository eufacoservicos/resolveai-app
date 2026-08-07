import { describe, it, expect } from "vitest";
import { formatWhatsApp, unformatWhatsApp, isValidWhatsApp } from "../phone";

describe("formatWhatsApp", () => {
  it("formats a full mobile number", () => {
    expect(formatWhatsApp("11999998888")).toBe("(11) 99999-8888");
  });

  // Quirk herdado do PWA: o corte e sempre na posicao 7, entao um fixo de 10
  // digitos sai como "(11) 33334-444" e nao "(11) 3333-4444". Documentado aqui
  // de proposito — mudar isso divergiria do web.
  it("splits at position 7 even for 10-digit landlines", () => {
    expect(formatWhatsApp("1133334444")).toBe("(11) 33334-444");
  });

  it("formats partial input progressively", () => {
    expect(formatWhatsApp("1")).toBe("1");
    expect(formatWhatsApp("11")).toBe("11");
    expect(formatWhatsApp("119")).toBe("(11) 9");
    expect(formatWhatsApp("1199999")).toBe("(11) 99999");
    expect(formatWhatsApp("11999998")).toBe("(11) 99999-8");
  });

  it("strips non-digits and extra digits", () => {
    expect(formatWhatsApp("(11) 99999-8888")).toBe("(11) 99999-8888");
    expect(formatWhatsApp("119999988889999")).toBe("(11) 99999-8888");
  });

  it("returns empty string for empty input", () => {
    expect(formatWhatsApp("")).toBe("");
  });
});

describe("unformatWhatsApp", () => {
  it("keeps only digits", () => {
    expect(unformatWhatsApp("(11) 99999-8888")).toBe("11999998888");
  });
});

describe("isValidWhatsApp", () => {
  it("accepts 10 and 11 digits", () => {
    expect(isValidWhatsApp("1133334444")).toBe(true);
    expect(isValidWhatsApp("(11) 99999-8888")).toBe(true);
  });

  it("rejects anything shorter or longer", () => {
    expect(isValidWhatsApp("999998888")).toBe(false);
    expect(isValidWhatsApp("119999988889")).toBe(false);
    expect(isValidWhatsApp("")).toBe(false);
  });
});
