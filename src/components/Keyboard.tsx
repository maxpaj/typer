type KeyboardLayoutProps = {
  highlight: string;
};

export function KeyboardLayout({ highlight }: KeyboardLayoutProps) {
  const renderKeyboardCharacter = (char: string, highlight: string) => {
    if (highlight === char) {
      return (
        <span
          key={char}
          onAnimationEnd={() => {
            console.log("ended");
          }}
          className="me-2 border px-1 rounded-sm highlight"
        >
          {char.toUpperCase()}
        </span>
      );
    }

    return (
      <span
        key={char}
        className="me-2 border border-transparent px-1 rounded-sm text-slate-500"
      >
        {char.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="text-sm">
      <div>
        {["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map((char) =>
          renderKeyboardCharacter(char, highlight)
        )}
      </div>
      <div className="mx-2 my-2">
        {["a", "s", "d", "f", "g", "h", "j", "k", "l"].map((char) =>
          renderKeyboardCharacter(char, highlight)
        )}
      </div>
      <div className="mx-6 my-2">
        {["z", "x", "c", "v", "b", "n", "m"].map((char) =>
          renderKeyboardCharacter(char, highlight)
        )}
      </div>

      {highlight === "␣" ? (
        <span className="mx-20 px-10 border border-red-500"></span>
      ) : (
        <span className="mx-20 px-10 border border-slate-500"></span>
      )}
    </div>
  );
}
