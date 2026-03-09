"use client";

import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function GlassCard({
  children,
  className = "",
  padding = "md",
  onClick
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[linear-gradient(127.09deg,rgba(6,11,40,0.94)_19.41%,rgba(10,14,35,0.49)_76.65%)]
        backdrop-blur-[120px]
        border-0
        rounded-[20px]
        shadow-[0_20px_27px_0_rgba(0,0,0,0.05)]
        ${paddingClasses[padding]}
        ${onClick ? "cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-colors" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default GlassCard;
