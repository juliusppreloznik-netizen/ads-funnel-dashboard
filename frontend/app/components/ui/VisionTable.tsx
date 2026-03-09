"use client";

import { ReactNode } from "react";

// Table Container
interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}

// Table Head
export function TableHead({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

// Table Body
export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

// Table Row
interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className = "", onClick }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`
        border-b border-[rgba(255,255,255,0.05)]
        hover:bg-[rgba(255,255,255,0.02)]
        transition-colors
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

// Table Header Cell
interface TableHeaderCellProps {
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableHeaderCell({
  children,
  className = "",
  onClick,
}: TableHeaderCellProps) {
  return (
    <th
      onClick={onClick}
      className={`
        py-3 px-4 text-left text-[10.4px] font-bold uppercase tracking-[0.05em]
        text-[#a0aec0] bg-[rgba(6,11,40,0.5)]
        ${onClick ? "cursor-pointer hover:bg-[rgba(255,255,255,0.05)]" : ""}
        ${className}
      `}
    >
      {children}
    </th>
  );
}

// Table Cell
interface TableCellProps {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
  title?: string;
}

export function TableCell({ children, className = "", colSpan, title }: TableCellProps) {
  return (
    <td
      colSpan={colSpan}
      title={title}
      className={`py-3 px-4 text-sm text-[#a0aec0] ${className}`}
    >
      {children}
    </td>
  );
}

// Badge Component
interface BadgeProps {
  children: ReactNode;
  color?: "green" | "red" | "yellow" | "blue" | "cyan" | "orange" | "gray" | "indigo" | "violet" | "purple" | "fuchsia";
  className?: string;
}

const badgeColors = {
  green: "bg-[#01b574]/20 text-[#01b574] border-[#01b574]/30",
  red: "bg-[#e31a1a]/20 text-[#e31a1a] border-[#e31a1a]/30",
  yellow: "bg-[#ffc107]/20 text-[#ffc107] border-[#ffc107]/30",
  blue: "bg-[#0075ff]/20 text-[#0075ff] border-[#0075ff]/30",
  cyan: "bg-[#00bcd4]/20 text-[#00bcd4] border-[#00bcd4]/30",
  orange: "bg-[#ff6b00]/20 text-[#ff6b00] border-[#ff6b00]/30",
  gray: "bg-[#718096]/20 text-[#718096] border-[#718096]/30",
  indigo: "bg-[#5c6bc0]/20 text-[#5c6bc0] border-[#5c6bc0]/30",
  violet: "bg-[#7928ca]/20 text-[#7928ca] border-[#7928ca]/30",
  purple: "bg-[#9c27b0]/20 text-[#9c27b0] border-[#9c27b0]/30",
  fuchsia: "bg-[#d946ef]/20 text-[#d946ef] border-[#d946ef]/30",
};

export function Badge({ children, color = "gray", className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        border
        ${badgeColors[color]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export default Table;
