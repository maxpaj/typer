"use client";

import { DEBUG } from "../Typer";
import { bezierPath } from "./bezier";

export type Serie = {
  label: string;
  data: Point[];
};

export type Point = {
  x: number;
  y: number;
  label: string;
};

type ChartProps = {
  type: "line" | "curve";
  series: Serie[];
  width: number;
  height: number;
  xLabel: string;
  yLabel: string;
  padding: number;
  className?: string;
  renderPoint?: (point: Point) => JSX.Element;
  renderPointLabel?: (point: Point) => JSX.Element;
};

const COLORS = ["red-500", "red-500", "red-500", "red-500", "red-500"];

export function Chart({
  className = "",
  series,
  width,
  height,
  xLabel = "X",
  yLabel = "Y",
  type = "line",
  renderPointLabel = (point) => <>{point.label}</>,
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

  function getChartCoordinates(points: Point[]) {
    return points.reduce((sum, curr) => {
      const x = getChartX(curr.x);
      const y = getChartY(curr.y);
      return [...sum, x, y];
    }, [] as number[]);
  }

  function renderDebug() {
    return [
      { x: 0, y: 2 },
      { x: width, y: height - 2 },
      { x: 0, y: height - 2 },
      { x: width, y: 2 },
    ].map((point) => (
      <text
        fontSize=".125em"
        className="font-mono fill-white"
        x={point.x}
        y={point.y}
        key={point.x * point.y + point.x + point.y}
      >
        ({point.x},{point.y})
      </text>
    ));
  }

  function renderCurve(serie: Point[], label: string, seriesColor: string) {
    const path = bezierPath(serie);

    return (
      <g key={label}>
        <path d={path} strokeWidth={0.2} className={`stroke-${seriesColor}`} />

        {serie.map((point) => {
          return (
            <text
              key={point.label + point.x + point.y}
              x={point.x}
              y={point.y}
              textAnchor="start"
              fontSize=".15em"
              className="font-mono fill-white"
            >
              {point.label}
            </text>
          );
        })}
      </g>
    );
  }

  function renderLine(points: Point[], label: string, seriesColor: string) {
    return (
      <g key={label}>
        {points.map((p, index) => {
          return (
            <line
              key={p.label}
              strokeWidth={0.2}
              className={`stroke-${seriesColor}`}
              x1={points[index].x}
              y1={points[index].y}
              x2={points[Math.min(index + 1, points.length - 1)].x}
              y2={points[Math.min(index + 1, points.length - 1)].y}
            />
          );
        })}
      </g>
    );
  }

  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`}>
      <>{false && renderDebug()}</>

      {series.map((serie, index) => {
        const seriesColor = COLORS[index % COLORS.length];
        const serieChartCoordinates = serie.data
          .map((s) => ({
            label: s.label,
            y: getChartY(s.y),
            x: getChartX(s.x),
          }))
          .sort((a, b) => a.x - b.x);

        switch (type) {
          case "curve":
            return renderCurve(serieChartCoordinates, serie.label, seriesColor);
          case "line":
            return renderLine(serieChartCoordinates, serie.label, seriesColor);
          default:
            throw new Error("No chart type set");
        }
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
