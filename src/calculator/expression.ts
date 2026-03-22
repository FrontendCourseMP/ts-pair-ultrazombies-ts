import { assertExpressionCharacters } from "./validator.js";
import { Stack } from "../stack.js";

type Token =
  | { kind: "num"; value: number }
  | { kind: "op"; value: "+" | "*" };

export interface EvalResult {
  result: number;
  steps: string[];
}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  const re = /\d+(\.\d+)?|[+*]/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(expr)) !== null) {
    const s = match[0];
    if (s === "+" || s === "*") {
      tokens.push({ kind: "op", value: s });
    } else {
      tokens.push({ kind: "num", value: Number(s) });
    }
  }

  return tokens;
}

function validateTokens(tokens: Token[]): void {
  if (tokens.length === 0) {
    throw new Error("Выражение пустое");
  }
  if (tokens[0].kind === "op") {
    throw new Error("Выражение не может начинаться с оператора");
  }
  if (tokens[tokens.length - 1].kind === "op") {
    throw new Error("Выражение не может заканчиваться оператором");
  }
  for (let i = 0; i < tokens.length - 1; i++) {
    const curr = tokens[i];
    const next = tokens[i + 1];
    if (curr.kind === "op" && next.kind === "op") {
      throw new Error("Два оператора подряд");
    }
    if (curr.kind === "num" && next.kind === "num") {
      throw new Error("Два числа подряд без оператора");
    }
  }
}

function priority(op: string): number {
  return op === "*" ? 2 : 1;
}

export function evaluate(expr: string): EvalResult {
  const trimmed = expr.trim();

  if (trimmed.length === 0) {
    throw new Error("Пустая строка");
  }

  assertExpressionCharacters(trimmed);

  const tokens = tokenize(trimmed);
  validateTokens(tokens);

  const numbers = new Stack<number>();
  const operators = new Stack<string>();
  const steps: string[] = [];

  function applyOperator(): void {
    const b = numbers.pop();
    const a = numbers.pop();
    const op = operators.pop();
    const result = op === "*" ? a * b : a + b;
    steps.push(`${a} ${op} ${b} = ${result}`);
    numbers.push(result);
  }

  for (const token of tokens) {
    if (token.kind === "num") {
      numbers.push(token.value);
    } else {
      while (!operators.isEmpty() && priority(operators.peek()!) >= priority(token.value)) {
        applyOperator();
      }
      operators.push(token.value);
    }
  }

  while (!operators.isEmpty()) {
    applyOperator();
  }

  return { result: numbers.pop(), steps };
}