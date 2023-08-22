import { Run } from "@/models/run";
import common, { randomizeWords } from "./common";
import { addMilliseconds, addSeconds } from "@/lib/date/date";
import { getRandom } from "@/lib/random";

export function getMockHistory() {
  const startDate = new Date();
  const runs = [
    getMockRun(60 + Math.floor(getRandom() * 20), startDate),
    getMockRun(
      90 + Math.floor(getRandom() * 30),
      addSeconds(startDate, (60 + Math.random() * 180) * 1000)
    ),
    getMockRun(
      100 + Math.floor(getRandom() * 40),
      addSeconds(startDate, (240 + Math.random() * 180) * 1000)
    ),
  ];

  return [getMockRun(5, startDate)];
}

export function getMockRun(
  numberOfWords: number,
  startDate: Date,
  seed = 2
): Run {
  const randomWords = randomizeWords(common, numberOfWords, seed);
  const wordTimePadding = (60 * 1000) / randomWords.length;

  const correctWordsSorted = randomWords
    .reduce(
      (sum, curr, index) => {
        const previousWordEnddate = sum[index]
          ? sum[index].endTimestamp
          : startDate;

        const endTimestamp = addMilliseconds(
          previousWordEnddate,
          125 + wordTimePadding * Math.random()
        );

        return [
          ...sum,
          {
            errors: Math.floor(Math.random() * Math.random() * curr.length),
            word: curr,
            endTimestamp,
          },
        ];
      },
      [
        {
          errors: 0,
          word: randomWords[Math.floor(getRandom() * randomWords.length)],
          endTimestamp: addMilliseconds(startDate, 125 + wordTimePadding),
        },
      ]
    )
    .sort((a, b) => a.endTimestamp.getTime() - b.endTimestamp.getTime());

  return {
    correctWords: correctWordsSorted,
    startDate: startDate,
    timeLimitSeconds: 60,
  };
}
