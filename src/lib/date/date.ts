export function addMilliseconds(date: Date, milliSeconds: number) {
  return new Date(date.getTime() + milliSeconds);
}

export function addSeconds(date: Date, seconds: number) {
  return new Date(date.getTime() + seconds * 1000);
}
