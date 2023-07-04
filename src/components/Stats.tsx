import { Run } from "@/models/run";
import { Chart } from "./Chart";

type StatsProps = {
  history: Run[];
};

export function Stats({ history }: StatsProps) {
  function renderRun(run: Run) {
    const correctWordsTotalLength = run.correctWords.reduce(
      (sum, c) => c.word.length + sum,
      0
    );

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
            <p>{run.errors.toFixed(0)} errors</p>
            <p>
              {(
                (100 * correctWordsTotalLength) /
                (correctWordsTotalLength + run.errors)
              ).toFixed(0)}
              % accuracy
            </p>
          </div>

          <div className="w-3/4 text-slate-400 flex flex-wrap content-baseline gap-x-1">
            {run.correctWords.map((c) => {
              const timeMillis =
                c.endTimestamp.getTime() - c.startTimestamp.getTime();

              return (
                <div style={{ flex: "0 0 160px" }} key={c.word + timeMillis}>
                  {c.word} ({timeMillis}ms)
                </div>
              );
            })}
          </div>
        </div>

        {false && (
          <Chart
            height={25}
            width={100}
            data={run.correctWords.map((c) => ({
              label: c.word,
              x: c.endTimestamp.getTime() - run.startDate.getTime(),
              y: c.endTimestamp.getTime() - c.startTimestamp.getTime(),
            }))}
            xLabel={"t"}
            yLabel={"ms"}
            padding={3}
          />
        )}
      </>
    );
  }

  return history
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
    .map(renderRun);
}
