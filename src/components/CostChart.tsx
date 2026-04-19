"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DailyUsage } from "@/lib/types";

interface CostChartProps {
  dailyUsage: DailyUsage[];
}

const PALETTE = ["#6366f1", "#8b5cf6", "#d946ef", "#f43f5e", "#f59e0b"];

function buildChartData(dailyUsage: DailyUsage[]) {
  const allModels = new Set<string>();
  for (const day of dailyUsage) {
    for (const model of Object.keys(day.models)) {
      allModels.add(model);
    }
  }
  const models = Array.from(allModels);

  const data = dailyUsage.map((day) => {
    const row: Record<string, string | number> = { date: day.date };
    for (const model of models) {
      row[model] = day.models[model]?.cost ?? 0;
    }
    return row;
  });

  return { data, models };
}

function shortModelName(model: string): string {
  const parts = model.split("/");
  return parts[parts.length - 1] ?? model;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
        padding: "0.6rem 0.8rem",
        fontSize: "0.8rem",
        color: "var(--text-primary)",
      }}
    >
      <div style={{ marginBottom: "0.4rem", color: "var(--text-muted)" }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, display: "inline-block" }} />
          <span style={{ color: "var(--text-muted)" }}>{shortModelName(entry.name)}:</span>
          <span>${entry.value.toFixed(4)}</span>
        </div>
      ))}
    </div>
  );
}

export default function CostChart({ dailyUsage }: CostChartProps) {
  if (!dailyUsage.length) {
    return (
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "260px",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
        }}
      >
        No usage data yet
      </div>
    );
  }

  const { data, models } = buildChartData(dailyUsage);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "0.75rem",
        padding: "1rem",
      }}
    >
      <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>
        Cost by Model
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            {models.map((model, i) => (
              <linearGradient key={model} id={`grad-cost-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
            formatter={(value: string) => shortModelName(value)}
          />
          {models.map((model, i) => (
            <Area
              key={model}
              type="monotone"
              dataKey={model}
              stroke={PALETTE[i % PALETTE.length]}
              fill={`url(#grad-cost-${i})`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
