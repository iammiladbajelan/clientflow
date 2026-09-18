"use client";

import {
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";
import { IconEye, IconEyeOff } from "@/components/icons";

const baseInput =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-60";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-slate-500">
          {hint}
        </span>
      )}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, type, ...rest } = props;
  const [show, setShow] = useState(false);

  if (type === "password") {
    return (
      <div className="relative">
        <input
          {...rest}
          type={show ? "text" : "password"}
          className={`${baseInput} pe-10 ${className ?? ""}`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          tabIndex={-1}
          aria-label={show ? "پنهان کردن رمز" : "نمایش رمز"}
          className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 transition hover:text-slate-300"
        >
          {show ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
    );
  }

  return <input {...props} type={type} className={`${baseInput} ${className ?? ""}`} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return (
    <select
      {...rest}
      className={`${baseInput} cursor-pointer appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pe-9 ${className ?? ""}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

export function TextArea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  const { className, ...rest } = props;
  return <textarea {...rest} className={`${baseInput} min-h-20 resize-y ${className ?? ""}`} />;
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "border border-slate-700 bg-slate-900 text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60",
  ghost:
    "text-slate-300 transition hover:bg-slate-800",
  danger:
    "bg-red-600 text-white shadow-sm shadow-red-600/30 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60",
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "w-full px-4 py-2.5 text-sm font-medium",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: keyof typeof buttonSizes;
}) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium outline-none transition ${buttonStyles[variant]} ${buttonSizes[size]} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function PrimaryButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  return <Button {...props} size="lg" />;
}
