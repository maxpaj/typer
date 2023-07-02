import { incorrectCharacterIndex } from "./words";
import { describe, expect, test } from "@jest/globals";

describe("words", () => {
  test("when the input and target are not equal, it should return the index of the first occurrence of mismatch", () => {
    const first = "hem";
    const second = "hej";
    expect(incorrectCharacterIndex(first, second)).toBe(2);
  });

  test("when the input is longer than target, it should return the index of the first occurrence of mismatch", () => {
    const first = "hejsan";
    const second = "hej";
    expect(incorrectCharacterIndex(first, second)).toBe(3);
  });

  test("when the input is incorrect at position zero, it should return -1", () => {
    const first = "ll";
    const second = "super";
    expect(incorrectCharacterIndex(first, second)).toBe(0);
  });

  test("when the input is one char, it should return correct", () => {
    const first = "s";
    const second = "super";
    expect(incorrectCharacterIndex(first, second)).toBe(1);
  });

  test("when the input is longer than target, it should return the index of the first occurrence of mismatch", () => {
    const first = "superrrrrrrr";
    const second = "super";
    expect(incorrectCharacterIndex(first, second)).toBe(5);
  });

  test("correct index is zero-based", () => {
    const first = "h";
    const second = "hejsan";
    expect(incorrectCharacterIndex(first, second)).toBe(1);
  });

  test("when the input is shorter than target, it should return the index of the first occurrence of mismatch", () => {
    const first = "he";
    const second = "hejsan";
    expect(incorrectCharacterIndex(first, second)).toBe(2);
  });

  test("when the input and target are equal, it should return the last index", () => {
    const first = "hej";
    const second = "hej";
    expect(incorrectCharacterIndex(first, second)).toBe(-1);
  });

  test("when no input it should return 0", () => {
    const first = "";
    const second = "hej";
    expect(incorrectCharacterIndex(first, second)).toBe(0);
  });
});
