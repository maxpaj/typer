export function mapKeyToChar(e: string) {
  switch (e) {
    case " ":
      return "␣";
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
      return "⌫";
    case "Meta":
    case "CapsLock":
    case "Escape":
    case "Shift":
      return "";
    default:
      return e;
  }
}
