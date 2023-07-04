type LineChartProps = {
  data: {
    x: number;
    y: number;
  }[];
  width: number;
  height: number;
};

export function LineChart({ data, width, height }: LineChartProps) {
  function getSvgX(x: number) {
    return (x / getMax(data.map((d) => d.x))) * width;
  }

  function getSvgY(y: number) {
    return height - (y / getMax(data.map((d) => d.y))) * height;
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
    <svg>
      <>
        {`M  ${getSvgX(data[0].x)} ${getSvgY(data[0].y)}`}
        {data.map((point, i) => `L ${getSvgX(point.x)} ${getSvgY(point.y)}`)}
      </>
    </svg>
  );
}
