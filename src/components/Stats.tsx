"use client";

import { Run } from "@/models/run";
import { Chart, Point, Serie } from "./chart/Chart";
import { getSlots } from "@/lib/stats/type-speed";
import { addSeconds } from "@/lib/date/date";

type StatsProps = {
  history: Run[];
};

export function Stats({ history }: StatsProps) {
  function renderRun(run: Run) {
    const correctWordsTotalLength = run.correctWords.reduce(
      (sum, c) => c.word.length + sum,
      0
    );

    const errors = run.correctWords.reduce((sum, curr) => sum + curr.errors, 0);
    const worst = run.correctWords.reduce((maxErrorsWord, currentWord) => {
      if (currentWord.errors > maxErrorsWord.errors) {
        return currentWord;
      }

      return maxErrorsWord;
    }, run.correctWords[0]).word;

    const accuracy =
      (100 * correctWordsTotalLength) / (correctWordsTotalLength + errors);

    return (
      <>
        <div key={run.startDate.toString()} className="mt-8 mb-4 flex gap-x-4">
          <div className="w-1/4">
            <p>{run.timeLimitSeconds}s</p>
            <p>{run.correctWords.length} words</p>
            <p>
              {((run.correctWords.length / run.timeLimitSeconds) * 60).toFixed(
                0
              )}{" "}
              WPM
            </p>

            <p className="mt-2">{correctWordsTotalLength} chars</p>
            <p>{errors.toFixed(0)} errors</p>
            <p>{accuracy.toFixed(0)}% accuracy</p>
          </div>

          <div className="w-3/4 flex flex-wrap content-baseline gap-x-1">
            {run.correctWords.map((c, index) => {
              const previousWordTimestamp = run.correctWords[index - 1]
                ? run.correctWords[index - 1].endTimestamp
                : run.startDate;

              const timeMillis =
                c.endTimestamp.getTime() - previousWordTimestamp.getTime();

              const className =
                worst === c.word ? "text-red-400" : "text-slate-400";

              return (
                <div
                  style={{ flex: "0 0 160px" }}
                  className={className}
                  key={c.word + timeMillis}
                >
                  {c.word} ({timeMillis} ms
                  {worst === c.word ? `, ${c.errors} errors` : ``}){" "}
                </div>
              );
            })}
          </div>
        </div>

        {false && (
          <Chart
            type="line"
            height={25}
            width={100}
            series={[
              {
                label: "",
                data: run.correctWords.map((c, index) => {
                  const previousWordTimestamp = run.correctWords[index - 1]
                    ? run.correctWords[index - 1].endTimestamp.getTime()
                    : run.startDate.getTime();

                  return {
                    label: c.word,
                    x: c.endTimestamp.getTime() - run.startDate.getTime(),
                    y: c.endTimestamp.getTime() - previousWordTimestamp,
                  };
                }),
              },
            ]}
            xLabel={"t"}
            yLabel={"ms"}
            padding={3}
          />
        )}
      </>
    );
  }

  const countSeries: Serie[] = history.map((run) => {
    return {
      label: run.startDate.getTime().toString(),
      data: run.correctWords.reduce(
        (sum, curr) => {
          return [
            ...sum,
            {
              label: "",
              x: curr.endTimestamp.getTime() - run.startDate.getTime(),
              y: sum.length + 1,
            },
          ];
        },
        [
          {
            label: "",
            x: 0,
            y: 0,
          },
        ] as Point[]
      ),
    };
  });

  const wpmSeries: Serie[] = history.map((run) => {
    const slots = getSlots(
      run.correctWords.map((c) => c.endTimestamp),
      run.startDate,
      addSeconds(run.startDate, run.timeLimitSeconds),
      5
    );

    return {
      label: run.startDate.getTime().toString(),
      data: slots.map((s, index) => ({
        x: index,
        y: s,
        label: `${s} wpm`,
      })),
    };
  });

  return (
    <>
      {
        <Chart
          className="mb-2"
          type="line"
          height={25}
          width={100}
          series={wpmSeries}
          renderPointLabel={(p) => (
            <text>
              {p.x} {p.y}
            </text>
          )}
          xLabel={"t"}
          yLabel={"wpm"}
          padding={5}
        />
      }

      <Chart
        type="line"
        height={25}
        width={100}
        series={countSeries}
        xLabel={"t"}
        yLabel={"w"}
        padding={5}
      />

      {history
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
        .map(renderRun)}
    </>
  );
}
