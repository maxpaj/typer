type ChartProps = {
  data: {
    x: number;
    y: number;
    label: string;
  }[];
  width: number;
  height: number;
  xLabel: string;
  yLabel: string;
  padding: number;
};

export function Chart({
  data,
  width,
  height,
  xLabel = "X",
  yLabel = "Y",
  padding = 10,
}: ChartProps) {
  function getChartX(x: number) {
    const xMax = getMax(data.map((d) => d.x));
    return (x / xMax) * width;
  }

  function getChartY(y: number) {
    const yMax = getMax(data.map((d) => d.y));
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
      <g>
        {data.map((d) => (
          <>
            <circle
              className="stroke-red-500"
              key={d.x + d.y}
              cx={getChartX(d.x)}
              cy={getChartY(d.y)}
              r="0.25"
            />

            <text
              font-size=".15em"
              className="font-mono fill-white"
              x={getChartX(d.x) + 1}
              y={getChartY(d.y) + 0.5}
            >
              {d.label}
            </text>
          </>
        ))}
      </g>

      <text
        x={getChartX(1)}
        y={getChartY(2)}
        font-size=".15em"
        className="font-mono fill-white"
      >
        {yLabel}
      </text>

      <text
        x={getChartX(width - 2)}
        y={getChartY(height - 1)}
        className="font-mono fill-white"
        font-size=".15em"
      >
        {xLabel}
      </text>

      <g
        className="stroke-red-500 opacity-25 stroke-[0.5]"
        fill="rgb(239 68 68)"
      >
        <line
          x1={getChartX(0)}
          x2={getChartX(width)}
          y1={getChartY(0)}
          y2={getChartY(0)}
        />

        <line
          x1={getChartX(0)}
          x2={getChartX(0)}
          y1={getChartX(0)}
          y2={getChartX(height)}
        />
      </g>
    </svg>
  );
}
