"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface VisionDonutChartProps {
  data: { name: string; value: number }[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const defaultColors = [
  "#0075ff",
  "#7928ca",
  "#01b574",
  "#ff6b6b",
  "#ffc107",
  "#00bcd4",
];

export function VisionDonutChart({
  data,
  colors = defaultColors,
  valueFormatter = (v) => String(v),
  className = "",
  showLegend = true,
  innerRadius = 60,
  outerRadius = 80,
}: VisionDonutChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={colors[idx % colors.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(6,11,40,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              boxShadow: "0 20px 27px 0 rgba(0,0,0,0.05)",
            }}
            labelStyle={{ color: "#ffffff", fontWeight: 600 }}
            itemStyle={{ color: "#a0aec0" }}
            formatter={(value) => [valueFormatter(Number(value) || 0), ""]}
          />
          {showLegend && (
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              formatter={(value) => (
                <span className="text-[#a0aec0] text-sm">{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default VisionDonutChart;
