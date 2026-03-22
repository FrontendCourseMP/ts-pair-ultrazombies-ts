class Stack {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.pop();
  }

  peek() {
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

function sanitize(input) {
  return input
    .replace(/[^\d.+* ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(expr) {
  const tokens = [];
  const re = /\d+(\.\d+)?|[+*]/g;
  let match;

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

function validate(tokens) {
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

function evaluate(expr) {
  const tokens = tokenize(expr);
  validate(tokens);

  const numbers = new Stack();
  const operators = new Stack();
  const steps = [];

  function priority(op) {
    return op === "*" ? 2 : 1;
  }

  function applyOperator() {
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
      while (!operators.isEmpty() && priority(operators.peek()) >= priority(token.value)) {
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

window.Calculator = { sanitize, evaluate };