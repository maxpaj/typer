export type Run = {
  startDate: Date;
  correctWords: CompletedWord[];
  timeLimitSeconds: number;
};

export type CompletedWord = {
  errors: number;
  word: string;
  endTimestamp: Date;
};
