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
import type { LatencyPoint } from "@/lib/types";

interface LatencyChartProps {
  latency: LatencyPoint[];
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
          <span>{(entry.value / 1000).toFixed(1)}s</span>
        </div>
      ))}
    </div>
  );
}

export default function LatencyChart({ latency }: LatencyChartProps) {
  if (!latency.length) {
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
        No latency data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={latency} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}s`}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "0.75rem", color: "var(--text-muted)" }} />
        <Line type="monotone" dataKey="avgMs" name="Avg" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="p95Ms" name="P95" stroke="#f97316" strokeWidth={2} strokeDasharray="5 3" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
