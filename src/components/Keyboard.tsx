"use client";

type KeyboardLayoutProps = {
  highlight: string;
  isCorrectChar: boolean;
};

export function KeyboardLayout({
  highlight,
  isCorrectChar = false,
}: KeyboardLayoutProps) {
  const renderKeyboardCharacter = (
    char: string,
    highlight: string,
    renderAs: string = char
  ) => {
    const isHighlighted = highlight === char;

    if (isHighlighted) {
      return (
        <span
          key={char}
          onAnimationEnd={() => {}}
          className="border px-1 rounded-sm highlight"
        >
          {(renderAs || char).toUpperCase()}
        </span>
      );
    }

    return (
      <span
        key={char}
        className="border px-1 rounded-sm border-transparent text-slate-500"
      >
        {(renderAs || char).toUpperCase()}
      </span>
    );
  };

  return (
    <div className="text-sm">
      <div className="ps-4">
        <div className="flex gap-2">
          {["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map((char) =>
            renderKeyboardCharacter(char, highlight)
          )}

          {renderKeyboardCharacter("⌫", highlight, "←")}
        </div>
        <div className="mx-2 my-2 flex gap-2">
          {["a", "s", "d", "f", "g", "h", "j", "k", "l"].map((char) =>
            renderKeyboardCharacter(char, highlight)
          )}
        </div>
        <div className="mx-6 my-2 flex gap-2">
          {["z", "x", "c", "v", "b", "n", "m"].map((char) =>
            renderKeyboardCharacter(char, highlight)
          )}
        </div>
      </div>

      {highlight === "␣" ? (
        <div className="mx-auto px-10 border border-red-500 w-2/5 h-4"></div>
      ) : (
        <div className="mx-auto px-10 border border-slate-500 w-2/5 h-4"></div>
      )}
    </div>
  );
}
