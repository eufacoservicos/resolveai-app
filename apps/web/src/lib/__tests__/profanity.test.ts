import { describe, it, expect } from "vitest";
import { containsProfanity } from "../profanity";

describe("containsProfanity", () => {
  it("detects blocked words", () => {
    expect(containsProfanity("merda")).toBe(true);
    expect(containsProfanity("Puta")).toBe(true);
    expect(containsProfanity("CARALHO")).toBe(true);
  });

  it("detects blocked words with accents", () => {
    expect(containsProfanity("cuzão")).toBe(true);
    expect(containsProfanity("desgraçado")).toBe(true);
  });

  it("detects multi-word phrases", () => {
    expect(containsProfanity("filho da puta")).toBe(true);
    expect(containsProfanity("vai se fuder")).toBe(true);
  });

  it("does not flag legitimate words", () => {
    expect(containsProfanity("Eletricista")).toBe(false);
    expect(containsProfanity("Pintor")).toBe(false);
    expect(containsProfanity("Encanador")).toBe(false);
    expect(containsProfanity("Custódia")).toBe(false);
    expect(containsProfanity("Açúcar")).toBe(false);
    expect(containsProfanity("Segurança")).toBe(false);
  });

  it("does not flag partial matches within words", () => {
    // "cu" is blocked but should not match inside "custódia" or "acumular"
    expect(containsProfanity("custódia")).toBe(false);
    expect(containsProfanity("acumular")).toBe(false);
    expect(containsProfanity("documento")).toBe(false);
  });

  it("handles empty and short strings", () => {
    expect(containsProfanity("")).toBe(false);
    expect(containsProfanity("a")).toBe(false);
  });
});
