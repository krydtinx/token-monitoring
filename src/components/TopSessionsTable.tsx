"use client";

import { useState } from "react";
import type { TopSession, Source } from "@/lib/types";

interface TopSessionsTableProps {
  topSessions: TopSession[];
}

type SortKey = keyof TopSession;

function truncateMiddle(str: string, maxLen = 50): string {
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

const SOURCE_COLORS: Record<Source, { bg: string; color: string }> = {
  opencode: { bg: "rgba(99,102,241,0.15)", color: "#818cf8" },
  hermes: { bg: "rgba(34,197,94,0.15)", color: "#4ade80" },
  "claude-code": { bg: "rgba(244,114,182,0.15)", color: "#f472b6" },
};

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "source", label: "Source" },
  { key: "title", label: "Session" },
  { key: "cost", label: "Cost" },
  { key: "inputTokens", label: "Input" },
  { key: "outputTokens", label: "Output" },
  { key: "messageCount", label: "Messages" },
];

export default function TopSessionsTable({ topSessions }: TopSessionsTableProps) {
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

  if (!topSessions.length) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "120px",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
        }}
      >
        No session data yet
      </div>
    );
  }

  const sorted = [...topSessions].sort((a, b) => {
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
            {sorted.map((row, i) => {
              const colors = SOURCE_COLORS[row.source];
              return (
                <tr
                  key={`${row.source}-${i}`}
                  style={{ transition: "background 0.1s" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = "";
                  }}
                >
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        background: colors.bg,
                        color: colors.color,
                      }}
                    >
                      {row.source}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: "sans-serif", maxWidth: "300px" }}>
                    <span title={row.title}>{truncateMiddle(row.title)}</span>
                  </td>
                  <td style={tdStyle}>{fmtCost(row.cost)}</td>
                  <td style={tdStyle}>{fmtNum(row.inputTokens)}</td>
                  <td style={tdStyle}>{fmtNum(row.outputTokens)}</td>
                  <td style={tdStyle}>{fmtNum(row.messageCount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
