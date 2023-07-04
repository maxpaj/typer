export const SPACE = "␣";
export const BACKSPACE = "⌫";

export function mapKeyToChar(e: string) {
  switch (e) {
    case " ":
      return SPACE;
    case "ArrowRight":
      return "→";
    case "ArrowLeft":
      return "←";
    case "ArrowUp":
      return "↑";
    case "Enter":
      return "⏎";
    case "ArrowDown":
      return "↓";
    case "Backspace":
      return BACKSPACE;
    case "Meta":
    case "CapsLock":
    case "Escape":
    case "Shift":
      return "";
    default:
      return e;
  }
}
