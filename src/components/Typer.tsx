"use client";

import { KeyboardEvent, useReducer, useRef, useState } from "react";
import { sleepStep } from "@/lib/sleep/sleep";
import { CompletedWord, Run } from "@/models/run";
import { Stats } from "./Stats";
import { KeyboardLayout } from "./Keyboard";
import { getMockHistory } from "@/data/mockState";
import { BACKSPACE, mapKeyToChar } from "@/lib/typer/key-to-char";
import {
  incorrectCharacterIndex,
  lastCorrectIndex,
} from "@/lib/typer/correct-chars";

const FONT_SIZE =
  typeof window !== "undefined"
    ? window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("font-size")
        .split("px")
        .map(parseInt)[0]
    : 10;

export const DEBUG =
  typeof window !== "undefined" && window.location.href.includes("localhost");

export const TIME_LIMIT = DEBUG ? 30 : 60;
const CHAR_WIDTH = FONT_SIZE / 2;
const START_WORD_INDEX = 10;
const WORDS = 7;
const WORDS_AHEAD = WORDS;
const WORDS_BEHIND = WORDS;

type TyperProps = {
  words: string[];
};

type RunningState = "RESET" | "RUNNING" | "STOPPED";

type ReducerState = {
  runningState: RunningState;
  completedRuns: Run[];
};

type ReducerAction = { action: RunningState };

export function Typer({ words }: TyperProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typedRaw, setTypedRaw] = useState("");
  const [typedWord, setTypedWord] = useState("");
  const [timeStep, setStepTime] = useState(new Date());
  const [runStartDate, setRunStartDate] = useState<Date | undefined>(undefined);

  const [currentWordIndex, setCurrentWordIndex] = useState(START_WORD_INDEX);
  const [currentWordErrors, setCurrentWordErrors] = useState(0);

  const [runCorrectWords, setRunCorrectWords] = useState<CompletedWord[]>([]);

  const [typerState, dispatchTyperState] = useReducer(stateReducer, {
    runningState: "RESET",
    completedRuns: getMockHistory(),
  });

  const targetWord = words[currentWordIndex];
  const incorrectCharIndex = incorrectCharacterIndex(typedWord, targetWord);

  function stateReducer(
    prevState: ReducerState,
    action: ReducerAction
  ): ReducerState {
    debug(action.action);

    switch (action.action) {
      case "RESET":
        return {
          completedRuns: prevState.completedRuns,
          runningState: "RESET",
        };
      case "RUNNING":
        return {
          completedRuns: prevState.completedRuns,
          runningState: "RUNNING",
        };

      case "STOPPED":
        const newHistoryState: Run[] = [
          ...prevState.completedRuns,
          {
            correctWords: runCorrectWords,
            startDate: runStartDate!,
            timeLimitSeconds: TIME_LIMIT,
          },
        ];

        return {
          runningState: "STOPPED",
          completedRuns: newHistoryState,
        };
    }
  }

  function reset() {
    dispatchTyperState({ action: "RESET" });
    setTypedWord(() => "");
    setRunCorrectWords([]);
    setRunStartDate(undefined);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    });
  }

  function keyDownListener(e: KeyboardEvent<HTMLInputElement>) {
    const char = mapKeyToChar(e.key);

    if (char === "") {
      return;
    }

    setTypedRaw(() => typedRaw + char);

    const correctWord = incorrectCharIndex === -1;
    const correctChar =
      lastCorrectIndex(typedWord + char, targetWord) === typedWord.length;

    if (char !== BACKSPACE && !correctChar) {
      setCurrentWordErrors(() => currentWordErrors + 1);
    }

    switch (e.key) {
      case "Meta":
      case "ArrowLeft":
      case "ArrowRight":
      case "ArrowDown":
      case "ArrowUp":
      case "Shift":
      case " ":
        if (correctWord) {
          setCurrentWordIndex(() => currentWordIndex + 1);
          setTypedWord(() => "");
          setCurrentWordErrors(() => 0);
          setRunCorrectWords(() => [
            ...runCorrectWords,
            {
              errors: currentWordErrors,
              word: targetWord,
              endTimestamp: new Date(),
            },
          ]);
        }
        return;
    }
  }

  function isStopped() {
    return typerState.runningState === "STOPPED";
  }

  function isRunning() {
    return typerState.runningState === "RUNNING";
  }

  function shouldClearInput(e: React.ChangeEvent<HTMLInputElement>) {
    const key = (e.nativeEvent as unknown as any).data;
    return key !== null && key === " ";
  }

  async function startTimer() {
    debug("RUNNING");
    const start = new Date();
    setRunStartDate(() => start);

    dispatchTyperState({ action: "RUNNING" });
    await sleepStep(TIME_LIMIT * 1000, 50, () => {
      setStepTime(() => new Date());
    });

    dispatchTyperState({ action: "STOPPED" });
    await sleepStep(3000, 100, () => {});

    reset();
  }

  function debug(s: string) {
    console.log(s, {
      correctWords: runCorrectWords,
      errors: currentWordErrors,
      startDate: runStartDate,
      time: timeStep,
    });
  }

  function shouldStart() {
    return runStartDate === undefined;
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (shouldClearInput(e)) {
      return;
    }

    if (shouldStart()) {
      startTimer();
    }

    setTypedWord(e.target.value);
  }

  function getElapsedMilliseconds() {
    if (
      typerState.runningState === "STOPPED" ||
      typerState.runningState === "RESET"
    ) {
      return TIME_LIMIT * 1000;
    }

    if (!runStartDate) {
      return TIME_LIMIT * 1000;
    }

    return new Date().getTime() - runStartDate.getTime();
  }

  function getScrollX() {
    const characters = words.slice(0, currentWordIndex).reduce((sum, curr) => {
      return sum + curr.length;
    }, 0);
    const textWidth = characters * CHAR_WIDTH;
    const spacesWidth = currentWordIndex * CHAR_WIDTH;
    const scrollX = -1 * (textWidth + spacesWidth);
    return scrollX;
  }

  function renderCurrentWord() {
    return (
      <span>
        {targetWord.split("").map((char, index) => {
          const isCorrectChar =
            incorrectCharIndex > index || incorrectCharIndex == -1;
          const isTooLong = typedWord.length > targetWord.length;
          const isTyped = typedWord.length > index;

          if (isTooLong) {
            return (
              <span
                key={targetWord + char + index}
                className="font-bold text-blue-400 [text-shadow:_0px_1px_2px_rgb(0_0_255_/_50%)] decoration-blue-400"
              >
                {char}
              </span>
            );
          }

          if (isTyped && isCorrectChar) {
            return (
              <span
                key={targetWord + char + index}
                className="font-bold text-green-400 [text-shadow:_0px_1px_2px_rgb(0_255_0_/_90%)] decoration-green-400"
              >
                {char}
              </span>
            );
          }

          if (isTyped && !isCorrectChar) {
            return (
              <span
                key={targetWord + char + index}
                className="font-bold text-red-400 [text-shadow:_0px_1px_2px_rgb(255_0_0_/_90%)] decoration-red-400"
              >
                {char}
              </span>
            );
          }

          return (
            <span key={targetWord + char + index} className="font-bold">
              {char}
            </span>
          );
        })}
      </span>
    );
  }

  function renderWord(word: string, wordIndex: number) {
    const fontSize = (1.5 * wordIndex) / WORDS_AHEAD;
    const style = {}; // { fontSize: `${fontSize}em` };

    return (
      <span
        key={word + wordIndex}
        className="font-thin text-slate-600"
        style={style}
      >
        {word}
      </span>
    );
  }

  function renderDebug() {
    return (
      <div>
        <p>{typerState.runningState}</p>
        <p>{typerState.completedRuns.length} runs</p>
      </div>
    );
  }

  function renderWords() {
    const _ = getScrollX();

    return (
      <div className="mb-5 words-container">
        <div className="words-container-left gap-2 w-1/2 overflow-hidden">
          {words
            .slice(currentWordIndex - WORDS_BEHIND, currentWordIndex)
            .map((w, index) => renderWord(w, index))}
        </div>
        <div className="words-container-center mx-2 text-xl">
          {renderCurrentWord()}
        </div>
        <div className="words-container-right gap-2 w-1/2 overflow-hidden">
          {words
            .slice(currentWordIndex + 1, currentWordIndex + WORDS_AHEAD + 1)
            .map((w, index) => renderWord(w, WORDS_AHEAD - index - 1))}
        </div>
      </div>
    );
  }

  return (
    <div className="font-mono">
      {isStopped() ? (
        <p className="text-center mb-4 fade-out">Finished!</p>
      ) : (
        <p className="mb-4">&nbsp;</p>
      )}

      {renderWords()}

      <div className="mb-5 flex justify-center">
        <input
          ref={inputRef}
          autoFocus={true}
          placeholder={isRunning() || isStopped() ? "" : "Start typing ..."}
          onKeyDown={keyDownListener}
          onChange={onChange}
          value={typedWord}
          disabled={isStopped()}
          className="bg-inherit text-center disabled:text-slate-500 focus:border-transparent light:text-black dark:text-white outline-none border-slate-500 border-2 w-1/2 p-4"
        />
      </div>

      <div className="flex justify-between mb-4 gap-4">
        <p className="basis-0 flex-grow"></p>

        <KeyboardLayout isCorrectChar={false} highlight={typedRaw.slice(-1)} />

        <p className="basis-0 flex-grow text-slate-500 border border-transparent text-sm">
          {(TIME_LIMIT - getElapsedMilliseconds() / 1000).toFixed(1)}s
        </p>
      </div>

      <div className="p-10">
        <div
          className={
            typerState.runningState === "RUNNING" ? "opacity-20" : "opacity-100"
          }
        >
          <Stats history={typerState.completedRuns} />
        </div>
      </div>
    </div>
  );
}
