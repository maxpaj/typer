function getSampleIndexer(
  startDate: Date,
  endDate: Date,
  samples: number = 60
) {
  const diffMilliseconds = endDate.getTime() - startDate.getTime();
  const frameSizeMilliseconds = diffMilliseconds / samples;
  const dateFrames = new Array(samples).fill(0).map((_, index) => {
    return {
      start: new Date(startDate.getTime() + frameSizeMilliseconds * index),
      end: new Date(startDate.getTime() + frameSizeMilliseconds * (index + 1)),
    };
  });

  return (date: Date) => {
    return dateFrames.findIndex((f) => {
      return (
        date.getTime() >= f.start.getTime() && date.getTime() < f.end.getTime()
      );
    });
  };
}

export function getSlots(
  dates: Date[],
  startDate: Date,
  endDate: Date,
  samples: number = 60
) {
  const findSlotIndex = getSampleIndexer(startDate, endDate, samples);
  const arr = new Array<number>(samples).fill(0);

  return dates.reduce((sum, curr) => {
    const index = findSlotIndex(curr);
    sum[index]++;
    return sum;
  }, arr);
}
