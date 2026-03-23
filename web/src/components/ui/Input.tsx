import { InputHTMLAttributes } from "react";
import clsx from "clsx";

export default function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full p-3 rounded-lg bg-slate-800 outline-none focus:ring-2 ring-indigo-500",
        className
      )}
      {...props}
    />
  );
}