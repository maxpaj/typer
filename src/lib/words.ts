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

export function correctCharacters(input: string, target: string) {
  if (input.length === 0 || target.length === 0) {
    return -1;
  }

  const lastIncorrect = input.split("").findIndex((char, index) => {
    return target[index] !== char;
  });

  if (lastIncorrect == target.length - 1) return true;

  const isCorrect = lastIncorrect === -1 && input.length <= target.length;
  const index = isCorrect ? input.length - 1 : lastIncorrect;

  console.log(input, target, lastIncorrect, index);

  return lastIncorrect;
}
