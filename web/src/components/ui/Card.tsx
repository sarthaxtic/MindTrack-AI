import { ReactNode } from "react";
import clsx from "clsx";

export default function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}