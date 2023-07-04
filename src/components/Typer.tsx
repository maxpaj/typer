"use client";

import { incorrectCharacterIndex, lastCorrectIndex } from "@/lib/words";
import { KeyboardEvent, useReducer, useState } from "react";
import { KeyboardLayout } from "./Keyboard";
import { BACKSPACE, mapKeyToChar } from "@/lib/key-to-char";
import { sleepStep } from "@/lib/sleep";

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

type CompletedWord = {
  word: string;
  timeMillis: number;
};

type Run = {
  startDate: Date;
  errors: number;
  correctWords: CompletedWord[];
};

export function Typer({ words }: TyperProps) {
  const [typedRaw, setTypedRaw] = useState("");
  const [typedWord, setTypedWord] = useState("");
  const [targetWordIndex, setTargetWordIndex] = useState(START_WORD_INDEX);
  const [timeStep, setStepTime] = useState(new Date());
  const [wordTime, setWordTimer] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [errors, setErrors] = useState(0);
  const [correctWords, setCorrectWords] = useState<CompletedWord[]>([]);

  const initialState: ReducerState = {
    runningState: "RESET",
    history: [],
  };

  const [state, dispatch] = useReducer(reducer, initialState);

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
              correctWords,
              errors,
              startDate: startDate!,
            },
          ],
        };
    }
  }

  function reset() {
    dispatch({ action: "RESET" });
    setTypedWord(() => "");
    setCorrectWords([]);
    setErrors(0);
    setStartDate(undefined);
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
      setErrors(() => errors + 1);
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
          setTypedWord("");
          setWordTimer(() => new Date());
          setCorrectWords(() => [
            ...correctWords,
            {
              word: targetWord,
              timeMillis: new Date().getTime() - wordTime!.getTime(),
            },
          ]);
        }
        return;
    }
  }

  function isStopped() {
    return state.runningState === "STOPPED";
  }

  function shouldClearInput(e: React.ChangeEvent<HTMLInputElement>) {
    const key = (e.nativeEvent as unknown as any).data;
    return key !== null && key === " ";
  }

  async function startTimer() {
    debug("Start");
    const start = new Date();
    setStartDate(() => start);
    setWordTimer(() => new Date());

    dispatch({ action: "RUNNING" });

    await sleepStep(TIME_LIMIT * 1000, 500, () => {
      setStepTime(() => new Date());
    });

    dispatch({ action: "STOPPED" });
  }

  function debug(state: string) {
    console.log(state, {
      correctWords,
      errors,
      startDate,
      time: timeStep,
    });
  }

  function shouldStart() {
    return startDate === undefined;
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

  function renderRun(run: Run, index: number) {
    const correctWordsTotalLength = run.correctWords.reduce(
      (sum, c) => c.word.length + sum,
      0
    );

    return (
      <div
        key={run.startDate.toString()}
        className={`mt-8 flex gap-x-4 ${
          index === 0 && state.runningState === "STOPPED"
            ? "text-white"
            : "text-slate-600"
        }`}
      >
        <div className="w-1/4">
          <p>{TIME_LIMIT}s</p>
          <p>{run.correctWords.length} words</p>
          <p>{((run.correctWords.length / TIME_LIMIT) * 60).toFixed(0)} WPM</p>

          <p className="mt-2">{correctWordsTotalLength} chars</p>
          <p>{run.errors.toFixed(0)} errors</p>
          <p>
            {(
              (100 * correctWordsTotalLength) /
              (correctWordsTotalLength + run.errors)
            ).toFixed(0)}
            % accuracy
          </p>
        </div>

        <div className="w-3/4 text-slate-600 flex flex-wrap content-baseline gap-x-1">
          {run.correctWords.map((c) => (
            <div style={{ flex: "0 0 160px" }} key={c.word + c.timeMillis}>
              {c.word} ({c.timeMillis}ms)
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderHistory() {
    return state.history
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
      .map(renderRun);
  }

  function getElapsedMilliseconds() {
    if (state.runningState === "STOPPED" || state.runningState === "RESET") {
      return TIME_LIMIT * 1000;
    }

    if (!startDate) {
      return TIME_LIMIT * 1000;
    }

    return new Date().getTime() - startDate.getTime();
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

  function renderWord(
    word: string,
    wordIndex: number,
    current: boolean = false
  ) {
    return current ? (
      <span key={word}>
        {word.split("").map((char, index) => {
          const isCorrectChar =
            incorrectCharIndex > index || incorrectCharIndex == -1;
          const isTooLong = typedWord.length > word.length;
          const isTyped = typedWord.length > index;

          if (isTooLong) {
            return (
              <span
                key={word + char + index + index * wordIndex}
                className="font-bold [text-shadow:_0px_1px_2px_rgb(0_0_255_/_50%)]"
              >
                {char}
              </span>
            );
          }

          if (isTyped && isCorrectChar) {
            return (
              <span
                key={word + char + index + index * wordIndex}
                className="font-bold [text-shadow:_0px_1px_2px_rgb(0_255_0_/_90%)]"
              >
                {char}
              </span>
            );
          }

          if (isTyped && !isCorrectChar) {
            return (
              <span
                key={word + char + index + index * wordIndex}
                className="font-bold [text-shadow:_0px_1px_2px_rgb(255_0_0_/_90%)]"
              >
                {char}
              </span>
            );
          }

          return (
            <span
              key={word + char + index + index * wordIndex}
              className="font-bold"
            >
              {char}
            </span>
          );
        })}
      </span>
    ) : (
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
      <div className="mb-5 words">
        <div className="gap-2 w-1/2 overflow-hidden">
          {words
            .slice(targetWordIndex - WORDS_BEHIND, targetWordIndex)
            .map((w, index) => renderWord(w, index, false))}
        </div>
        <div className="mx-2">
          {words
            .slice(targetWordIndex, targetWordIndex + 1)
            .map((w, index) => renderWord(w, index, true))}
        </div>
        <div className="gap-2 w-1/2 overflow-hidden">
          {words
            .slice(targetWordIndex + 1, targetWordIndex + WORDS_AHEAD + 1)
            .map((w, index) => renderWord(w, index, false))}
        </div>
      </div>
    );
  }

  return (
    <div className="font-mono">
      {renderWords()}

      <div className="flex justify-between mb-4 gap-4">
        <p className="basis-0 flex-grow"></p>

        <KeyboardLayout highlight={typedRaw.slice(-1)} />

        <p className="basis-0 flex-grow text-slate-500 border border-transparent text-sm">
          {(TIME_LIMIT - getElapsedMilliseconds() / 1000).toFixed(1)}s
        </p>
      </div>

      <div className="flex justify-center">
        <input
          autoFocus={true}
          placeholder={isStopped() ? "..." : "Start typing ..."}
          onKeyDown={keyDownListener}
          onChange={onChange}
          value={typedWord}
          disabled={isStopped()}
          className="bg-black disabled:text-slate-500 focus:border-transparent text-white outline-none border-slate-500 border-2 w-1/2 p-4"
        />
      </div>

      <div className="p-10">
        {state.history.length > 0 && (
          <button
            disabled={!isStopped()}
            onClick={() => reset()}
            className="disabled:text-slate-500 text-xs my-4 text-red-500 hover:text-white"
          >
            Try again?
          </button>
        )}

        {renderHistory()}
      </div>
    </div>
  );
}
