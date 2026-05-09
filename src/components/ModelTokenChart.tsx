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
import type { DailyUsage } from "@/lib/types";

interface ModelTokenChartProps {
  dailyUsage: DailyUsage[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function shortModelName(model: string): string {
  const parts = model.split("/");
  return parts[parts.length - 1] ?? model;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, e) => s + e.value, 0);
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
          <span style={{ width: 8, height: 8, borderRadius: "2px", background: entry.color, display: "inline-block" }} />
          <span style={{ color: "var(--text-muted)" }}>{entry.name}:</span>
          <span>{entry.value.toLocaleString()}</span>
        </div>
      ))}
      <div style={{ borderTop: "1px solid var(--border)", marginTop: "0.3rem", paddingTop: "0.3rem", color: "var(--text-muted)" }}>
        Total: {total.toLocaleString()}
      </div>
    </div>
  );
}

export default function ModelTokenChart({ dailyUsage }: ModelTokenChartProps) {
  if (!dailyUsage.length) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "300px",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
        }}
      >
        No usage data yet
      </div>
    );
  }

  const totals = new Map<string, { input: number; output: number; cacheRead: number }>();
  for (const day of dailyUsage) {
    for (const [key, val] of Object.entries(day.models)) {
      const model = key.includes("|") ? key.slice(key.indexOf("|") + 1) : key;
      const existing = totals.get(model) ?? { input: 0, output: 0, cacheRead: 0 };
      existing.input += val.input_tokens;
      existing.output += val.output_tokens;
      existing.cacheRead += val.cache_read_tokens;
      totals.set(model, existing);
    }
  }

  const data = Array.from(totals.entries())
    .filter(([, v]) => v.input + v.output + v.cacheRead > 0)
    .sort((a, b) => (b[1].input + b[1].output + b[1].cacheRead) - (a[1].input + a[1].output + a[1].cacheRead))
    .map(([model, v]) => ({
      model: shortModelName(model),
      Input: v.input,
      Output: v.output,
      "Cache Read": v.cacheRead,
    }));

  if (!data.length) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "300px",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
        }}
      >
        No token data yet
      </div>
    );
  }

  const hasCacheRead = data.some((d) => d["Cache Read"] > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="model"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, "auto"]}
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
          width={44}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "0.75rem", color: "var(--text-muted)" }} />
        <Bar dataKey="Input" stackId="a" fill="#3b82f6" />
        <Bar dataKey="Output" stackId="a" fill="#22c55e" radius={hasCacheRead ? [0, 0, 0, 0] : [2, 2, 0, 0]} />
        {hasCacheRead && <Bar dataKey="Cache Read" stackId="a" fill="#f97316" radius={[2, 2, 0, 0]} />}
      </BarChart>
    </ResponsiveContainer>
  );
}
