import * as readline from "readline";

// ─── Класс Stack<T> ───────────────────────────────────────────────────────────
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// ─── Типы ─────────────────────────────────────────────────────────────────────
type Token = { kind: "num"; value: number } | { kind: "op"; value: "+" | "*" };

interface Step {
  expr: string;
  value: number;
}

// ─── Очистка строки от недопустимых символов ──────────────────────────────────
function sanitize(raw: string): string {
  return raw
    .replace(/[^\d.+* ]/g, "") // убрать всё кроме цифр, точки, +, *, пробела
    .replace(/\s+/g, " ") // множественные пробелы → один
    .trim();
}

// ─── Токенизация ──────────────────────────────────────────────────────────────
function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  const re = /\d+(\.\d+)?|[+*]/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(expr)) !== null) {
    const s = m[0];
    if (s === "+" || s === "*") tokens.push({ kind: "op", value: s });
    else tokens.push({ kind: "num", value: Number(s) });
  }

  return tokens;
}

// ─── Валидация токенов ────────────────────────────────────────────────────────
function validate(tokens: Token[]): void {
  if (tokens.length === 0) throw new Error("Выражение пустое после очистки");

  if (tokens[0].kind === "op")
    throw new Error(`Выражение начинается с оператора "${tokens[0].value}"`);

  if (tokens[tokens.length - 1].kind === "op")
    throw new Error("Выражение заканчивается оператором");

  for (let i = 0; i < tokens.length - 1; i++) {
    const curr = tokens[i];
    const next = tokens[i + 1];

    if (curr.kind === "op" && next.kind === "op")
      throw new Error(
        `Два оператора подряд: "${curr.value}" и "${next.value}"`,
      );

    if (curr.kind === "num" && next.kind === "num")
      throw new Error(
        `Два числа подряд без оператора: ${curr.value} и ${next.value}`,
      );
  }
}

// ─── Вычисление (Shunting-yard, два стека) ────────────────────────────────────
function evaluate(expr: string): { result: number; steps: Step[] } {
  const tokens = tokenize(expr);
  validate(tokens);

  const numStack = new Stack<number>();
  const opStack = new Stack<string>();
  const steps: Step[] = [];

  const precedence = (op: string): number => (op === "*" ? 2 : 1);

  const applyTop = (): void => {
    const b = numStack.pop()!;
    const a = numStack.pop()!;
    const op = opStack.pop()!;
    const r = op === "*" ? a * b : a + b;
    steps.push({ expr: `${a} ${op} ${b}`, value: r });
    numStack.push(r);
  };

  for (const tok of tokens) {
    if (tok.kind === "num") {
      numStack.push(tok.value);
    } else {
      while (
        !opStack.isEmpty() &&
        precedence(opStack.peek()!) >= precedence(tok.value)
      )
        applyTop();
      opStack.push(tok.value);
    }
  }

  while (!opStack.isEmpty()) applyTop();

  if (numStack.size() !== 1) throw new Error("Некорректное выражение");

  return { result: numStack.pop()!, steps };
}

// ─── Форма ввода / вывода (readline) ─────────────────────────────────────────
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Введите выражение (только цифры, + и *): ", (input: string) => {
  const cleaned = sanitize(input);

  if (cleaned !== input.trim()) {
    console.log(`\nСтрока очищена:`);
    console.log(`  до:   "${input}"`);
    console.log(`  после: "${cleaned}"`);
  }

  console.log("");

  try {
    const { result, steps } = evaluate(cleaned);

    console.log("Шаги вычисления:");
    steps.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.expr} = ${s.value}`);
    });

    console.log(`\nРезультат: ${result}`);
  } catch (e: any) {
    console.error(`Ошибка: ${e.message}`);
  }

  rl.close();
});
