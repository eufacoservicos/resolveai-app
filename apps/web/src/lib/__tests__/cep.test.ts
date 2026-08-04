import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatCep, isValidCep, fetchCepData, geocodeAddress } from "../cep";

describe("formatCep", () => {
  it("formats a full CEP", () => {
    expect(formatCep("01001000")).toBe("01001-000");
  });

  it("formats partial input progressively", () => {
    expect(formatCep("0")).toBe("0");
    expect(formatCep("01001")).toBe("01001");
    expect(formatCep("010010")).toBe("01001-0");
    expect(formatCep("01001000")).toBe("01001-000");
  });

  it("strips non-digit characters", () => {
    expect(formatCep("01001-000")).toBe("01001-000");
  });

  it("returns empty string for empty input", () => {
    expect(formatCep("")).toBe("");
  });
});

describe("isValidCep", () => {
  it("returns true for valid 8-digit CEP", () => {
    expect(isValidCep("01001000")).toBe(true);
    expect(isValidCep("01001-000")).toBe(true);
  });

  it("returns false for invalid CEP", () => {
    expect(isValidCep("0100")).toBe(false);
    expect(isValidCep("")).toBe(false);
    expect(isValidCep("123456789")).toBe(false);
  });
});

describe("fetchCepData", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null for CEP with wrong length", async () => {
    expect(await fetchCepData("123")).toBeNull();
  });

  it("returns parsed data for valid CEP", async () => {
    const mockResponse = {
      cep: "01001-000",
      logradouro: "Praça da Sé",
      bairro: "Sé",
      localidade: "São Paulo",
      uf: "SP",
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetchCepData("01001000");
    expect(result).toEqual({
      cep: "01001-000",
      street: "Praça da Sé",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
    });
  });

  it("returns null when API returns error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ erro: true }),
    } as Response);

    expect(await fetchCepData("00000000")).toBeNull();
  });

  it("returns null on network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"));
    expect(await fetchCepData("01001000")).toBeNull();
  });

  it("returns null when response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
    } as Response);

    expect(await fetchCepData("01001000")).toBeNull();
  });

  it("handles empty fields gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        cep: "12345-678",
        logradouro: "",
        bairro: "",
        localidade: "",
        uf: "",
      }),
    } as Response);

    const result = await fetchCepData("12345678");
    expect(result).toEqual({
      cep: "12345-678",
      street: "",
      neighborhood: "",
      city: "",
      state: "",
    });
  });

  it("strips non-digits from input", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        cep: "01001-000",
        logradouro: "Rua",
        bairro: "Bairro",
        localidade: "Cidade",
        uf: "SP",
      }),
    } as Response);

    await fetchCepData("01001-000");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://viacep.com.br/ws/01001000/json/",
      expect.any(Object)
    );
  });
});

describe("geocodeAddress", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns coordinates for valid address", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [{ lat: "-23.5505", lon: "-46.6333" }],
    } as Response);

    const result = await geocodeAddress("São Paulo", "SP", "Sé");
    expect(result).toEqual({
      latitude: -23.5505,
      longitude: -46.6333,
    });
  });

  it("returns null when no results", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    expect(await geocodeAddress("Inexistente", "XX")).toBeNull();
  });

  it("returns null on network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network"));
    expect(await geocodeAddress("São Paulo", "SP")).toBeNull();
  });

  it("returns null when response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
    } as Response);

    expect(await geocodeAddress("São Paulo", "SP")).toBeNull();
  });

  it("returns null when results is null", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    } as Response);

    expect(await geocodeAddress("São Paulo", "SP")).toBeNull();
  });

  it("builds query with neighborhood when provided", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [{ lat: "-23.55", lon: "-46.63" }],
    } as Response);

    await geocodeAddress("São Paulo", "SP", "Centro");
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url).toContain("Centro");
  });

  it("builds query without neighborhood when not provided", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => [{ lat: "-23.55", lon: "-46.63" }],
    } as Response);

    await geocodeAddress("São Paulo", "SP");
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url).toContain("S%C3%A3o+Paulo");
  });
});
