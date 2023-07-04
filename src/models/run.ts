export type Run = {
  startDate: Date;
  errors: number;
  correctWords: CompletedWord[];
  timeLimitSeconds: number;
};

export type CompletedWord = {
  word: string;
  startTimestamp: Date;
  endTimestamp: Date;
};
