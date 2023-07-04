"use client";

import { KeyboardEvent, useReducer, useRef, useState } from "react";
import { incorrectCharacterIndex, lastCorrectIndex } from "@/lib/words";
import { BACKSPACE, mapKeyToChar } from "@/lib/key-to-char";
import { sleepStep } from "@/lib/sleep";
import { CompletedWord, Run } from "@/models/run";
import { Stats } from "./Stats";
import { KeyboardLayout } from "./Keyboard";

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

export const TIME_LIMIT = DEBUG ? 5 : 60;
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
  history: Run[];
};

type ReducerAction = { action: RunningState };

export function Typer({ words }: TyperProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typedRaw, setTypedRaw] = useState("");
  const [typedWord, setTypedWord] = useState("");
  const [timeStep, setStepTime] = useState(new Date());
  const [targetWordIndex, setTargetWordIndex] = useState(START_WORD_INDEX);
  const [wordStartTimestamp, setWordStartTimestamp] = useState(new Date());
  const [runStartDate, setRunStartDate] = useState<Date | undefined>(undefined);

  const [runErrors, setRunErrors] = useState(0);
  const [runCorrectWords, setRunCorrectWords] = useState<CompletedWord[]>([]);

  const [state, dispatch] = useReducer(reducer, {
    runningState: "RESET",
    history: [],
  });

  const targetWord = words[targetWordIndex];
  const incorrectCharIndex = incorrectCharacterIndex(typedWord, targetWord);

  function reducer(
    prevState: ReducerState,
    action: ReducerAction
  ): ReducerState {
    switch (action.action) {
      case "RESET":
        debug("RESET");

        return {
          history: prevState.history,
          runningState: "RESET",
        };
      case "RUNNING":
        debug("RUNNING");
        return {
          history: prevState.history,
          runningState: "RUNNING",
        };

      case "STOPPED":
        debug("STOPPED");
        return {
          runningState: "STOPPED",
          history: [
            ...prevState.history,
            {
              correctWords: runCorrectWords,
              errors: runErrors,
              startDate: runStartDate!,
              timeLimitSeconds: TIME_LIMIT,
            },
          ],
        };
    }
  }

  function reset() {
    dispatch({ action: "RESET" });
    setTypedWord(() => "");
    setRunCorrectWords([]);
    setRunErrors(0);
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
      setRunErrors(() => runErrors + 1);
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
          setTargetWordIndex(() => targetWordIndex + 1);
          setTypedWord(() => "");
          setWordStartTimestamp(() => new Date());
          setRunCorrectWords(() => [
            ...runCorrectWords,
            {
              word: targetWord,
              endTimestamp: new Date(),
              startTimestamp: wordStartTimestamp!,
            },
          ]);
        }
        return;
    }
  }

  function isStopped() {
    return state.runningState === "STOPPED";
  }

  function isRunning() {
    return state.runningState === "RUNNING";
  }

  function shouldClearInput(e: React.ChangeEvent<HTMLInputElement>) {
    const key = (e.nativeEvent as unknown as any).data;
    return key !== null && key === " ";
  }

  async function startTimer() {
    debug("RUNNING");
    const start = new Date();
    setRunStartDate(() => start);
    setWordStartTimestamp(() => new Date());

    dispatch({ action: "RUNNING" });
    await sleepStep(TIME_LIMIT * 1000, 50, () => {
      setStepTime(() => new Date());
    });

    dispatch({ action: "STOPPED" });
    await sleepStep(3000, 100, () => {});

    reset();
  }

  function debug(state: string) {
    console.log(state, {
      correctWords: runCorrectWords,
      errors: runErrors,
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
    if (state.runningState === "STOPPED" || state.runningState === "RESET") {
      return TIME_LIMIT * 1000;
    }

    if (!runStartDate) {
      return TIME_LIMIT * 1000;
    }

    return new Date().getTime() - runStartDate.getTime();
  }

  function getScrollX() {
    const characters = words.slice(0, targetWordIndex).reduce((sum, curr) => {
      return sum + curr.length;
    }, 0);
    const textWidth = characters * CHAR_WIDTH;
    const spacesWidth = targetWordIndex * CHAR_WIDTH;
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
                className="font-bold text-green-400 [text-shadow:_0px_1px_2px_rgb(0_255_0_/_90%)] decoration-green-400 underline"
              >
                {char}
              </span>
            );
          }

          if (isTyped && !isCorrectChar) {
            return (
              <span
                key={targetWord + char + index}
                className="font-bold text-red-400 [text-shadow:_0px_1px_2px_rgb(255_0_0_/_90%)] decoration-red-400 underline"
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
    return (
      <span key={word + wordIndex} className="font-thin text-slate-600">
        {word}
      </span>
    );
  }

  function renderDebug() {
    return (
      <div>
        <p>{state.runningState}</p>
        <p>{state.history.length} runs</p>
      </div>
    );
  }

  function renderWords() {
    const _ = getScrollX();

    return (
      <div className="mb-5 words-container">
        <div className="words-container-left gap-2 w-1/2 overflow-hidden">
          {words
            .slice(targetWordIndex - WORDS_BEHIND, targetWordIndex)
            .map((w, index) => renderWord(w, index))}
        </div>
        <div className="words-container-center mx-2">{renderCurrentWord()}</div>
        <div className="words-container-right gap-2 w-1/2 overflow-hidden">
          {words
            .slice(targetWordIndex + 1, targetWordIndex + WORDS_AHEAD + 1)
            .map((w, index) => renderWord(w, index))}
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
            state.runningState === "RUNNING" ? "opacity-20" : "opacity-100"
          }
        >
          <Stats history={state.history} />
        </div>
      </div>
    </div>
  );
}
