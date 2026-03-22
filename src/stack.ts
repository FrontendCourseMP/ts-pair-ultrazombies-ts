export class Stack<T> {
  private readonly items: T[] = [];

  push(value: T): void {
    this.items.push(value);
  }

  pop(): T {
    const value = this.items.pop();
    if (value === undefined) {
      throw new Error("Попытка взять из пустого стека");
    }
    return value;
  }

  peek(): T | undefined {
    return this.items.at(-1);
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}