import { evaluate } from "./expression.js";
import { sanitize } from "./validator.js";

const exprInputEl = document.querySelector<HTMLInputElement>("#exprInput");
const calcBtnEl = document.querySelector<HTMLButtonElement>("#calcBtn");
const outputEl = document.querySelector<HTMLDivElement>("#output");

if (!exprInputEl || !calcBtnEl || !outputEl) {
  throw new Error("Не найдены элементы #exprInput, #calcBtn или #output");
}

const exprInput: HTMLInputElement = exprInputEl;
const calcBtn: HTMLButtonElement = calcBtnEl;
const output: HTMLDivElement = outputEl;

function calculate(): void {
  const raw = exprInput.value;
  const cleaned = sanitize(raw);
  let html = "";

  if (cleaned !== raw.trim()) {
    html += `
      <div class="clean-notice">
        Строка очищена от лишних символов:<br>
        <strong>было:</strong> "${raw}"<br>
        <strong>стало:</strong> "${cleaned}"
      </div>`;
  }

  try {
    const { result, steps } = evaluate(cleaned);

    if (steps.length > 0) {
      html += `<p class="steps-label">Шаги вычисления</p><ul class="steps-list">`;
      steps.forEach((step, i) => {
        html += `<li>${i + 1}. ${step}</li>`;
      });
      html += `</ul>`;
    }

    html += `<div class="result-box">= ${result}</div>`;
  } catch (err) {
    html += `<div class="error-box">Ошибка: ${err instanceof Error ? err.message : String(err)}</div>`;
  }

  output.innerHTML = html;
}

calcBtn.addEventListener("click", calculate);
exprInput.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter") calculate();
});