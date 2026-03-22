const DISALLOWED = /[^0-9+*\s.]/;

export function sanitize(input: string): string {
  return input
    .replace(/[^\d.+* ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function assertExpressionCharacters(input: string): void {
  if (DISALLOWED.test(input)) {
    throw new Error("Допустимы только цифры, пробелы, точка, + и *");
  }
}