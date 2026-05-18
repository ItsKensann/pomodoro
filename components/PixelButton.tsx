"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "default" | "primary" | "accent" | "ghost";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const variantClass: Record<Variant, string> = {
  default: "bg-panel text-cream hover:bg-panel-soft",
  primary: "bg-pink text-night-deep hover:bg-pink-deep hover:text-cream",
  accent: "bg-cyan text-night-deep hover:bg-mauve hover:text-cream",
  ghost: "bg-transparent text-cream hover:bg-panel-soft",
};

const sizeClass = {
  sm: "px-2 py-1 text-[8px]",
  md: "px-3 py-2 text-[10px]",
  lg: "px-5 py-3 text-[12px]",
};

export function PixelButton({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...rest
}: PixelButtonProps) {
  return (
    <button
      {...rest}
      className={`
        font-pixel
        bevel-out
        active:bevel-in
        active:translate-x-px active:translate-y-px
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        cursor-pointer
        leading-none
        ${variantClass[variant]}
        ${sizeClass[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
