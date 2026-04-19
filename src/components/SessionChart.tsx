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
import type { DailySession } from "@/lib/types";

interface SessionChartProps {
  dailySessions: DailySession[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
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
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.fill, display: "inline-block" }} />
          <span style={{ color: "var(--text-muted)" }}>{entry.name}:</span>
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function SessionChart({ dailySessions }: SessionChartProps) {
  if (!dailySessions.length) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "220px",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
        }}
      >
        No session data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={dailySessions} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={32}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "0.75rem", color: "var(--text-muted)" }} />
        <Bar dataKey="opencode" name="Opencode" fill="#818cf8" stackId="a" radius={[0, 0, 0, 0]} />
        <Bar dataKey="hermes" name="Hermes" fill="#4ade80" stackId="a" radius={[0, 0, 0, 0]} />
        <Bar dataKey="claudeCode" name="Claude Code" fill="#f472b6" stackId="a" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
