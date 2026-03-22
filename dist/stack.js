export class Stack {
    items = [];
    push(value) {
        this.items.push(value);
    }
    pop() {
        const value = this.items.pop();
        if (value === undefined) {
            throw new Error("Попытка взять из пустого стека");
        }
        return value;
    }
    peek() {
        return this.items.at(-1);
    }
    isEmpty() {
        return this.items.length === 0;
    }
}
//# sourceMappingURL=stack.js.map