// Обобщённый класс Stack<T>
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

// Тип токена
type Token = { kind: 'num'; value: number }
           | { kind: 'op';  value: '+' | '*' };

// Токенизация строки
function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  const re = /\d+(\.\d+)?|[+*]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(expr)) !== null) {
    const s = m[0];
    if (s === '+' || s === '*')
      tokens.push({ kind: 'op', value: s });
    else
      tokens.push({ kind: 'num', value: Number(s) });
  }
  return tokens;
}

// Вычисление через два стека (Shunting-yard)
interface Step { expr: string; value: number }

function evaluate(expr: string): { result: number; steps: Step[] } {
  const tokens = tokenize(expr);
  if (tokens.length === 0) throw new Error('Пустое выражение');

  const numStack  = new Stack<number>();
  const opStack   = new Stack<string>();
  const steps: Step[] = [];

  const precedence = (op: string) => op === '*' ? 2 : 1;

  const applyTop = () => {
    const b = numStack.pop()!;
    const a = numStack.pop()!;
    const op = opStack.pop()!;
    const r = op === '*' ? a * b : a + b;
    steps.push({ expr: `${a} ${op} ${b}`, value: r });
    numStack.push(r);
  };

  for (const tok of tokens) {
    if (tok.kind === 'num') {
      numStack.push(tok.value);
    } else {
      while (!opStack.isEmpty() &&
             precedence(opStack.peek()!) >= precedence(tok.value))
        applyTop();
      opStack.push(tok.value);
    }
  }
  while (!opStack.isEmpty()) applyTop();

  if (numStack.size() !== 1)
    throw new Error('Некорректное выражение');

  return { result: numStack.pop()!, steps };
}

import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const VALID = /[^\d.+* ]/g;

function sanitize(raw: string): string {
  return raw
    .replace(/[^\d.+* ]/g, '')   // убрать недопустимые символы
    .replace(/\s+/g, ' ')        // множественные пробелы → один
    .trim();                     // обрезать края
}

function validate(tokens: Token[]): void {
  if (tokens.length === 0)
    throw new Error('Выражение пустое');

  if (tokens[0].kind === 'op')
    throw new Error(`Выражение начинается с оператора "${tokens[0].value}"`);

  if (tokens[tokens.length - 1].kind === 'op')
    throw new Error(`Выражение заканчивается оператором`);

  for (let i = 0; i < tokens.length - 1; i++) {
    const curr = tokens[i];
    const next = tokens[i + 1];
    if (curr.kind === 'op' && next.kind === 'op')
      throw new Error(`Два оператора подряд: "${curr.value}" и "${next.value}"`);
    if (curr.kind === 'num' && next.kind === 'num')
      throw new Error(`Два числа подряд без оператора: ${curr.value} и ${next.value}`);
  }
}

function evaluate(expr: string): { result: number; steps: Step[] } {
  const tokens = tokenize(expr);
  validate(tokens);  // <-- добавили

  const numStack = new Stack<number>();
  const opStack  = new Stack<string>();
  const steps: Step[] = [];

  const precedence = (op: string) => op === '*' ? 2 : 1;

  const applyTop = () => {
    const b = numStack.pop()!;
    const a = numStack.pop()!;
    const op = opStack.pop()!;
    const r = op === '*' ? a * b : a + b;
    steps.push({ expr: `${a} ${op} ${b}`, value: r });
    numStack.push(r);
  };

  for (const tok of tokens) {
    if (tok.kind === 'num') {
      numStack.push(tok.value);
    } else {
      while (!opStack.isEmpty() &&
             precedence(opStack.peek()!) >= precedence(tok.value))
        applyTop();
      opStack.push(tok.value);
    }
  }
  while (!opStack.isEmpty()) applyTop();

  if (numStack.size() !== 1)
    throw new Error('Некорректное выражение');

  return { result: numStack.pop()!, steps };
}
