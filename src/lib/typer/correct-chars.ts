export function incorrectCharacterIndex(input: string, target: string) {
  if (input.length === 0) {
    return 0;
  }

  if (target.length === 0) {
    throw new Error("Target is empty");
  }

  const incorrectIndex = target.split("").findIndex((char, index) => {
    return input[index] !== char;
  });

  if (incorrectIndex === -1 && input.length > target.length) {
    return target.length;
  }

  return incorrectIndex;
}

export function lastCorrectIndex(input: string, target: string) {
  const lastCorrect = target.split("").findIndex((char, index) => {
    return input[index] !== char;
  });

  if (lastCorrect === -1) {
    return input.length - 1;
  }

  return lastCorrect - 1;
}
