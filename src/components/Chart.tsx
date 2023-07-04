type Serie = {
  label: string;
  data: Point[];
};

type Point = {
  x: number;
  y: number;
  label: string;
};

type ChartProps = {
  type: "line" | "point";
  series: Serie[];
  width: number;
  height: number;
  xLabel: string;
  yLabel: string;
  padding: number;
};

const COLORS = ["red-500", "red-500", "red-500", "red-500", "red-500"];

export function Chart({
  series,
  width,
  height,
  xLabel = "X",
  yLabel = "Y",
  type = "line",
  padding = 1,
}: ChartProps) {
  const xMax = Math.max(...series.flatMap((s) => s.data).map((d) => d.x));
  const yMax = Math.max(...series.flatMap((s) => s.data).map((d) => d.y));

  function getChartX(x: number) {
    return (x / xMax) * width;
  }

  function getChartY(y: number) {
    return height - (y / yMax) * height;
  }

  function getMax(arr: number[]) {
    return arr.reduce((max, curr) => {
      if (max > curr) {
        return max;
      }

      return curr;
    });
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      {series.map((serie, index) => {
        const seriesColor = COLORS[index % COLORS.length];

        return (
          <g key={serie.label}>
            {serie.data.map((point, index) => (
              <>
                <text
                  fontSize=".15em"
                  className="font-mono fill-white"
                  x={getChartX(point.x) + 1}
                  y={getChartY(point.y) + 0.5}
                >
                  {point.label}
                </text>

                {type === "line" && index > 0 && (
                  <line
                    strokeWidth={0.1}
                    className={`stroke-${seriesColor}`}
                    x1={getChartX(point.x)}
                    x2={getChartX(serie.data[index - 1].x)}
                    y1={getChartY(point.y)}
                    y2={getChartY(serie.data[index - 1].y)}
                  />
                )}
              </>
            ))}
          </g>
        );
      })}

      <text
        x={1}
        y={2}
        textAnchor="start"
        fontSize=".15em"
        className="font-mono fill-white"
      >
        {yLabel}
      </text>

      <text
        x={width - 1}
        y={height - 1}
        className="font-mono fill-white"
        fontSize=".15em"
        textAnchor="end"
      >
        {xLabel}
      </text>

      <g
        className="stroke-red-500 opacity-25 stroke-[0.5]"
        fill="rgb(239 68 68)"
      >
        <line x1={0} x2={width} y1={height} y2={height} />
        <line x1={0} x2={0} y1={0} y2={height} />
      </g>
    </svg>
  );
}
