import { describe, expect, test } from "@jest/globals";
import { getSlots } from "./type-speed";

describe("getSlots", () => {
  test("should return frames with the correct words within each frame", () => {
    const dates = [
      new Date("2023-07-10 10:00:01"),
      new Date("2023-07-10 10:00:01"),
      new Date("2023-07-10 10:00:01"),
      new Date("2023-07-10 10:00:01"),
      new Date("2023-07-10 10:00:02"),
      new Date("2023-07-10 10:00:03"),
    ];

    const frameFrequencies = getSlots(
      dates,
      new Date("2023-07-10 10:00:00"),
      new Date("2023-07-10 10:00:10"),
      10
    );

    expect(frameFrequencies.length).toBe(10);
    expect(frameFrequencies[0]).toBe(0);
    expect(frameFrequencies[1]).toBe(4);
    expect(frameFrequencies[2]).toBe(1);
    expect(frameFrequencies[3]).toBe(1);
  });
});
