"use client";

import { useState } from "react";
import StatCard from "@/components/StatCard";
import ModelTable from "@/components/ModelTable";
import CostChart from "@/components/CostChart";
import TokenChart from "@/components/TokenChart";
import type { DashboardData, DailyUsage, Source } from "@/lib/types";

function fmtNum(n: number): string {
  return n.toLocaleString();
}

function fmtCost(n: number): string {
  return "$" + n.toFixed(4);
}

const SOURCES: Source[] = ["opencode", "hermes"];
const SOURCE_LABELS: Record<Source, string> = {
  opencode: "Opencode",
  hermes: "Hermes",
};
const SOURCE_COLORS: Record<Source, string> = {
  opencode: "#818cf8",
  hermes: "#4ade80",
};

function filterDailyBySource(dailyUsage: DailyUsage[], source: Source): DailyUsage[] {
  return dailyUsage
    .map((day) => {
      const models: DailyUsage["models"] = {};
      let total_cost = 0;
      let total_tokens = 0;
      let total_requests = 0;
      for (const [key, val] of Object.entries(day.models)) {
        if (val.source === source) {
          const model = key.includes("|") ? key.slice(key.indexOf("|") + 1) : key;
          models[model] = val;
          total_cost += val.cost;
          total_tokens += val.input_tokens + val.output_tokens;
          total_requests += val.requests;
        }
      }
      return { date: day.date, total_cost, total_tokens, total_requests, models };
    })
    .filter((day) => Object.keys(day.models).length > 0);
}

export default function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/usage/refresh", { method: "POST" });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Refresh failed");
      }

      const usageRes = await fetch("/api/usage");
      if (!usageRes.ok) throw new Error("Failed to fetch");
      setData(await usageRes.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text-primary)" }}>
      {/* Nav */}
      <nav
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          background: "var(--surface)",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "1rem" }}>Token Usage</span>
        <div style={{ display: "flex", gap: "1rem" }}>
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>Dashboard</span>
        </div>
      </nav>

      <main style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        {data.modelStats.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "1rem" }}>
              No usage data yet
            </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Click Refresh to sync data from opencode and hermes databases.
              </p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.5rem 1.25rem",
                cursor: refreshing ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                opacity: refreshing ? 0.7 : 1,
              }}
            >
              {refreshing ? "Syncing..." : "↻ Refresh"}
            </button>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <StatCard
                label="Total Cost"
                value={fmtCost(data.totalCost)}
                subValue={`opencode: ${fmtCost(data.sourceCosts?.opencode ?? 0)} / hermes: ${fmtCost(data.sourceCosts?.hermes ?? 0)}`}
              />
              <StatCard
                label="Total Tokens"
                value={fmtNum(data.totalTokens)}
                subValue={`opencode: ${fmtNum(data.sourceTokens?.opencode ?? 0)} / hermes: ${fmtNum(data.sourceTokens?.hermes ?? 0)}`}
              />
              <StatCard label="Total Requests" value={fmtNum(data.totalRequests)} />
              <StatCard label="Active Models" value={data.activeModels} />
            </div>

            {/* Refresh */}
            <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 1.25rem",
                  cursor: refreshing ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  opacity: refreshing ? 0.7 : 1,
                }}
              >
                {refreshing ? "Syncing..." : "↻ Refresh"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "#2d1515",
                  border: "1px solid #5c2a2a",
                  borderRadius: "0.5rem",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  color: "#f87171",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </div>
            )}

            {/* Model Table */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "var(--text-muted)",
                }}
              >
                BY MODEL
              </h2>
              <ModelTable stats={data.modelStats} />
            </div>

            {/* Charts — one section per source */}
            {SOURCES.filter((s) => data.dailyUsage.some((d) => Object.values(d.models).some((m) => m.source === s))).map((source) => {
              const filtered = filterDailyBySource(data.dailyUsage, source);
              if (filtered.length === 0) return null;
              return (
                <div key={source} style={{ marginBottom: "1.5rem" }}>
                  <h2
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      marginBottom: "0.75rem",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        background: `${SOURCE_COLORS[source]}22`,
                        color: SOURCE_COLORS[source],
                      }}
                    >
                      {SOURCE_LABELS[source]}
                    </span>
                    <span style={{ fontSize: "0.85rem" }}>
                      {fmtCost(filtered.reduce((s, d) => s + d.total_cost, 0))} total
                    </span>
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.75rem",
                        padding: "1rem",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          marginBottom: "0.75rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Cost
                      </h3>
                      <CostChart dailyUsage={filtered} />
                    </div>
                    <div
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.75rem",
                        padding: "1rem",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          marginBottom: "0.75rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Tokens
                      </h3>
                      <TokenChart dailyUsage={filtered} />
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}