import { describe, it, expect } from "vitest";
import {
  getWhatsAppUrl,
  getCategoryGroup,
  getSubcategorySlugs,
  isInGroup,
} from "../constants";

describe("getWhatsAppUrl", () => {
  it("builds URL with country code and encoded default message", () => {
    const url = getWhatsAppUrl("11999999999");
    expect(url).toContain("https://wa.me/5511999999999");
    expect(url).toContain("text=");
    expect(url).toContain("eufa%C3%A7o");
  });

  it("includes provider name in default message", () => {
    const url = getWhatsAppUrl("11999999999", "João");
    const decoded = decodeURIComponent(url.split("text=")[1]);
    expect(decoded).toContain("João");
    expect(decoded).toContain("eufaço!");
  });

  it("uses custom message when provided", () => {
    const url = getWhatsAppUrl("11999999999", "João", "Olá, tudo bem?");
    const decoded = decodeURIComponent(url.split("text=")[1]);
    expect(decoded).toBe("Olá, tudo bem?");
  });

  it("strips non-digit characters from phone", () => {
    const url = getWhatsAppUrl("(11) 99999-9999");
    expect(url).toContain("wa.me/5511999999999");
  });
});

describe("getCategoryGroup", () => {
  it("finds group for a known subcategory", () => {
    const group = getCategoryGroup("eletricista");
    expect(group).toBeDefined();
    expect(group!.slug).toBe("instalacoes");
  });

  it("returns undefined for unknown slug", () => {
    expect(getCategoryGroup("nao-existe")).toBeUndefined();
  });
});

describe("getSubcategorySlugs", () => {
  it("returns subcategories for a known group", () => {
    const slugs = getSubcategorySlugs("pets");
    expect(slugs).toContain("dog-walker");
    expect(slugs).toContain("veterinario");
  });

  it("returns empty array for unknown group", () => {
    expect(getSubcategorySlugs("inexistente")).toEqual([]);
  });
});

describe("isInGroup", () => {
  it("returns true for a slug in the group", () => {
    expect(isInGroup("pets", "dog-walker")).toBe(true);
  });

  it("returns false for a slug not in the group", () => {
    expect(isInGroup("pets", "eletricista")).toBe(false);
  });

  it("returns false for unknown group", () => {
    expect(isInGroup("nao-existe", "eletricista")).toBe(false);
  });
});
