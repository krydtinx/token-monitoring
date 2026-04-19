"use client";

import { useState } from "react";
import type { ModelStats } from "@/lib/types";

interface ModelTableProps {
  stats: ModelStats[];
}

type SortKey = keyof ModelStats;

function truncateMiddle(str: string, maxLen = 40): string {
  if (str.length <= maxLen) return str;
  const half = Math.floor((maxLen - 3) / 2);
  return str.slice(0, half) + "..." + str.slice(str.length - half);
}

function fmtNum(n: number): string {
  return n.toLocaleString();
}

function fmtCost(n: number): string {
  return "$" + n.toFixed(4);
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "model", label: "Model" },
  { key: "requests", label: "Requests" },
  { key: "input_tokens", label: "Input" },
  { key: "output_tokens", label: "Output" },
  { key: "cache_read_tokens", label: "Cache Read" },
  { key: "cache_write_tokens", label: "Cache Write" },
  { key: "reasoning_tokens", label: "Reasoning" },
  { key: "cost", label: "Cost" },
  { key: "cost_pct", label: "% Cost" },
];

export default function ModelTable({ stats }: ModelTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("cost");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...stats].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "string" && typeof bv === "string") {
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  const thStyle: React.CSSProperties = {
    padding: "0.6rem 0.75rem",
    textAlign: "left",
    color: "var(--text-muted)",
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    borderBottom: "1px solid var(--border)",
  };

  const tdStyle: React.CSSProperties = {
    padding: "0.6rem 0.75rem",
    fontFamily: "monospace",
    fontSize: "0.85rem",
    color: "var(--text-primary)",
    borderBottom: "1px solid var(--border)",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              {COLUMNS.map(({ key, label }) => (
                <th key={key} style={thStyle} onClick={() => handleSort(key)}>
                  {label}
                  {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.model}
                style={{ transition: "background 0.1s" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background = "";
                }}
              >
                <td style={{ ...tdStyle, fontFamily: "sans-serif", maxWidth: "260px" }}>
                  <span title={row.model}>{truncateMiddle(row.model)}</span>
                </td>
                <td style={tdStyle}>{fmtNum(row.requests)}</td>
                <td style={tdStyle}>{fmtNum(row.input_tokens)}</td>
                <td style={tdStyle}>{fmtNum(row.output_tokens)}</td>
                <td style={tdStyle}>{fmtNum(row.cache_read_tokens)}</td>
                <td style={tdStyle}>{fmtNum(row.cache_write_tokens)}</td>
                <td style={tdStyle}>{fmtNum(row.reasoning_tokens)}</td>
                <td style={tdStyle}>{fmtCost(row.cost)}</td>
                <td style={{ ...tdStyle, minWidth: "120px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                      style={{
                        flex: 1,
                        height: "6px",
                        background: "var(--surface-2)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${row.cost_pct}%`,
                          height: "100%",
                          background: "var(--accent)",
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                    <span style={{ minWidth: "38px", textAlign: "right" }}>
                      {row.cost_pct.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}