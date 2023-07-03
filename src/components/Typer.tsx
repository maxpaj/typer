"use client";

import { incorrectCharacterIndex } from "@/lib/words";
import { KeyboardEventHandler, useState } from "react";
import { KeyboardLayout } from "./Keyboard";
import { mapKeyToChar } from "@/lib/key-to-char";

const FONT_SIZE =
  typeof window !== "undefined"
    ? window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("font-size")
        .split("px")
        .map(parseInt)[0]
    : 10;

const TIME_LIMIT = 60;
const CHAR_WIDTH = FONT_SIZE / 2;
const START_WORD_INDEX = 10;
const WORDS_AHEAD = 5;
const WORDS_BEHIND = 5;

type TyperProps = {
  words: string[];
};

export function Typer({ words }: TyperProps) {
  const [typedRaw, setTypedRaw] = useState("");
  const [typedWord, setTypedWord] = useState("");
  const [targetWordIndex, setTargetWordIndex] = useState(START_WORD_INDEX);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState(new Date());
  const [stopped, setStopped] = useState(false);

  const targetWord = words[targetWordIndex];
  const incorrectCharIndex = incorrectCharacterIndex(typedWord, targetWord);

  const keyDownListener: KeyboardEventHandler = (e) => {
    const char = mapKeyToChar(e.key);
    setTypedRaw(() => typedRaw + char);

    const correctSpelled = incorrectCharIndex === -1;

    switch (e.key) {
      case "Meta":
      case "ArrowLeft":
      case "ArrowRight":
      case "ArrowDown":
      case "ArrowUp":
      case "Shift":
      case " ":
        if (correctSpelled) {
          setTargetWordIndex(() => targetWordIndex + 1);
          setTypedWord("");
        }
        return;
    }
  };

  const shouldClear = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = (e.nativeEvent as unknown as any).data;
    return key !== null && key === " ";
  };

  const reset = () => {
    setStopped(false);
    setTypedRaw("");
    setTypedWord("");
    setStartDate(undefined);
  };

  const startTimer = () => {
    const start = new Date();

    setStartDate(() => start);

    const interval = setInterval(() => {
      const step = new Date();
      setTime(() => step);

      if (!start) {
        return;
      }

      const elapsed = step.getTime() - start.getTime();
      if (elapsed / 1000 < TIME_LIMIT) {
        return;
      }

      clearInterval(interval);
      stopTimer();
    }, 45);

    return () => {
      clearInterval(interval);
    };
  };

  const stopTimer = () => {
    setStopped(true);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (shouldClear(e)) {
      return;
    }

    if (!startDate) {
      startTimer();
    }

    setTypedWord(e.target.value);
  };

  const renderStats = () => {
    if (!startDate) {
      return <></>;
    }

    const wordsPerSecond =
      (targetWordIndex - START_WORD_INDEX) / getElapsedMilliseconds() / 1000;

    return (
      <div className="text-slate-600">
        <p>{targetWordIndex - START_WORD_INDEX} words</p>
        <p>{(wordsPerSecond * 60).toFixed(0)} WPM</p>

        {stopped && (
          <button
            onClick={() => reset()}
            className="text-xs my-4 text-red-500 hover:text-white"
          >
            Try again?
          </button>
        )}
      </div>
    );
  };

  const getElapsedMilliseconds = () => {
    if (startDate === undefined) {
      return 1;
    }

    return new Date().getTime() - startDate.getTime();
  };

  const getScrollX = () => {
    const characters = words.slice(0, targetWordIndex).reduce((sum, curr) => {
      return sum + curr.length;
    }, 0);
    const textWidth = characters * CHAR_WIDTH;
    const spacesWidth = targetWordIndex * CHAR_WIDTH;
    const scrollX = -1 * (textWidth + spacesWidth);
    return scrollX;
  };

  const renderWord = (word: string, current: boolean = false) => {
    return current ? (
      <span key={word}>
        {word.split("").map((char, index) => {
          const isCorrectChar =
            incorrectCharIndex > index || incorrectCharIndex == -1;

          return isCorrectChar ? (
            <span
              key={char + index}
              className="text-green-400 [text-shadow:_0px_1px_2px_rgb(0_255_0_/_90%)]"
            >
              {char}
            </span>
          ) : (
            <span
              key={char + index}
              className="text-red-500 [text-shadow:_0px_1px_2px_rgb(255_0_0_/_90%)]"
            >
              {char}
            </span>
          );
        })}
      </span>
    ) : (
      <span key={word} className="text-slate-400">
        {word}
      </span>
    );
  };

  const renderWords = () => {
    const _ = getScrollX();

    return (
      <div className="mb-5 words">
        <div className="gap-2">
          {words
            .slice(targetWordIndex - WORDS_BEHIND, targetWordIndex)
            .map((w) => renderWord(w, false))}
        </div>
        <div className="mx-2">
          {words
            .slice(targetWordIndex, targetWordIndex + 1)
            .map((w) => renderWord(w, true))}
        </div>
        <div className="gap-2">
          {words
            .slice(targetWordIndex + 1, targetWordIndex + WORDS_AHEAD + 1)
            .map((w) => renderWord(w, false))}
        </div>
      </div>
    );
  };

  return (
    <div className="font-mono">
      {renderWords()}

      <div className="flex justify-between mb-4 gap-4">
        <p className="basis-0 flex-grow"></p>

        <KeyboardLayout highlight={typedRaw.slice(-1)} />

        <p className="basis-0 flex-grow text-slate-500">
          {(TIME_LIMIT - getElapsedMilliseconds() / 1000).toFixed(1)}s
        </p>
      </div>

      <input
        autoFocus={true}
        placeholder={stopped ? "..." : "Start typing ..."}
        onKeyDown={keyDownListener}
        onChange={onChange}
        value={typedWord}
        disabled={stopped}
        className="bg-black disabled:text-slate-500 text-white outline-none border-slate-800 border-2 w-full p-4"
      />

      <div className="flex p-10 justify-between">{renderStats()}</div>
    </div>
  );
}
