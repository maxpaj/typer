import { HTMLProps } from "react";

type TooltipProps = HTMLProps<HTMLDivElement>;

export function Tooltip({ children }: TooltipProps) {
  return (
    <div
      className="z-50 fixed"
      style={{
        top: 10,
        left: 10,
      }}
    >
      {children}
    </div>
  );
}
