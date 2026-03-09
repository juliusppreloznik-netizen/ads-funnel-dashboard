"use client";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  iconBgColor?: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  iconBgColor = "bg-[#0075ff]",
  subtitle,
  trend,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`
        bg-[linear-gradient(127.09deg,rgba(6,11,40,0.94)_19.41%,rgba(10,14,35,0.49)_76.65%)]
        backdrop-blur-[120px]
        border border-[rgba(255,255,255,0.1)]
        rounded-[20px]
        shadow-[0_20px_27px_0_rgba(0,0,0,0.05)]
        p-[17px]
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[#a0aec0] text-xs font-medium uppercase tracking-wider mb-1">
            {title}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-white text-lg font-bold">{value}</span>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-[#01b574]" : "text-[#e31a1a]"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <span className="text-[#a0aec0] text-xs mt-1">{subtitle}</span>
          )}
        </div>
        {icon && (
          <div
            className={`
              w-12 h-12 rounded-[12px] flex items-center justify-center
              ${iconBgColor}
            `}
          >
            <span className="text-white">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
