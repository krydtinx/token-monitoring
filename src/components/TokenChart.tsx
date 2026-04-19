"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DailyUsage } from "@/lib/types";

interface TokenChartProps {
  dailyUsage: DailyUsage[];
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
          <span style={{ color: "var(--text-muted)" }}>{entry.name}:</span>
          <span>{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function TokenChart({ dailyUsage }: TokenChartProps) {
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

  const data = dailyUsage.map((day) => ({
    date: day.date,
    "Input Tokens": Object.values(day.models).reduce((s, m) => s + m.input_tokens, 0),
    "Output Tokens": Object.values(day.models).reduce((s, m) => s + m.output_tokens, 0),
  }));

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
        Token Usage
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            width={44}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "0.75rem", color: "var(--text-muted)" }} />
          <Line
            type="monotone"
            dataKey="Input Tokens"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Output Tokens"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
