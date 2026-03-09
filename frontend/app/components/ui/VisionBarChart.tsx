"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface VisionBarChartProps {
  data: Record<string, string | number>[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  layout?: "horizontal" | "vertical";
}

const defaultColors = ["#0075ff", "#01b574", "#7928ca", "#ff6b6b", "#ffc107"];

export function VisionBarChart({
  data,
  index,
  categories,
  colors = defaultColors,
  valueFormatter = (v) => String(v),
  className = "",
  showLegend = true,
  showGrid = true,
  layout = "horizontal",
}: VisionBarChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              vertical={false}
            />
          )}
          <XAxis
            dataKey={layout === "horizontal" ? index : undefined}
            type={layout === "horizontal" ? "category" : "number"}
            stroke="#a0aec0"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey={layout === "vertical" ? index : undefined}
            type={layout === "vertical" ? "category" : "number"}
            stroke="#a0aec0"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={layout === "horizontal" ? valueFormatter : undefined}
          />
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
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
              formatter={(value) => (
                <span className="text-[#a0aec0] text-sm">{value}</span>
              )}
            />
          )}
          {categories.map((category, idx) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colors[idx % colors.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default VisionBarChart;
