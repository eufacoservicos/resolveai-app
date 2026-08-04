/**
 * Blocklist-based profanity filter for category names (pt-BR).
 *
 * The list is intentionally kept short and focused on clearly offensive terms.
 * Normalisation strips accents and lowercases before matching so that trivial
 * bypasses like "PuTa" or "cuzão" are still caught.
 */

const BLOCKED_WORDS: string[] = [
  // Insultos / palavrões comuns
  "porra",
  "merda",
  "caralho",
  "puta",
  "putaria",
  "puteiro",
  "buceta",
  "boceta",
  "cu",
  "cuzao",
  "arrombado",
  "arrombada",
  "fdp",
  "filho da puta",
  "filha da puta",
  "vagabunda",
  "vagabundo",
  "viado",
  "viadinho",
  "piranha",
  "otario",
  "otaria",
  "babaca",
  "imbecil",
  "idiota",
  "retardado",
  "retardada",
  "corno",
  "cornudo",
  "canalha",
  "desgraça",
  "desgraçado",
  "desgraca",
  "desgracado",
  "pau no cu",
  "vai se fuder",
  "vai tomar no cu",
  "foda-se",
  "fodase",
  "pqp",
  "vsf",
  "vtnc",
  // Slurs / termos discriminatórios
  "macaco",
  "macaca",
  "crioulo",
  "crioula",
  "negrinho",
  "negrinha",
  "sapatao",
  "traveco",
];

/**
 * Normalise a string for comparison: lowercase, strip diacritics, collapse whitespace.
 */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns `true` when the given text contains a blocked word.
 *
 * Matching is done on whole-word boundaries so that legitimate words like
 * "custódia" are not flagged by the substring "cu".
 */
export function containsProfanity(text: string): boolean {
  const normalised = normalise(text);

  return BLOCKED_WORDS.some((word) => {
    const normWord = normalise(word);
    // Multi-word phrases: simple includes check
    if (normWord.includes(" ")) {
      return normalised.includes(normWord);
    }
    // Single words: whole-word boundary match
    const regex = new RegExp(`\\b${normWord}\\b`);
    return regex.test(normalised);
  });
}

export const PROFANITY_ERROR_MESSAGE =
  "O nome da categoria contém termos inadequados. Por favor, escolha outro nome.";
