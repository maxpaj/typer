"use client";

type TypedProps = { typedRaw: string };

export function Typed({ typedRaw }: TypedProps) {
  return (
    <div className="w-full flex flex-wrap mt-10 text-slate-600">
      {typedRaw.split("").map((t, index) => (
        <span key={t + index}>{t}</span>
      ))}
    </div>
  );
}
