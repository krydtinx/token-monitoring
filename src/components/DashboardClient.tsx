"use client";

import { useState, useMemo } from "react";
import StatCard from "@/components/StatCard";
import ModelTable from "@/components/ModelTable";
import CostChart from "@/components/CostChart";
import TokenChart from "@/components/TokenChart";
import ModelTokenChart from "@/components/ModelTokenChart";
import SessionChart from "@/components/SessionChart";
import ToolChart from "@/components/ToolChart";
import HourlyChart from "@/components/HourlyChart";
import { getToday, getWeekStart, getMonthStart } from "@/lib/timezone";
import LatencyChart from "@/components/LatencyChart";
import TopSessionsTable from "@/components/TopSessionsTable";
import DateFilter, { type FilterType } from "@/components/DateFilter";
import type { DashboardData, DailyUsage, ModelStats, Source } from "@/lib/types";
import { getModelCosts } from "@/lib/pricing";

function fmtNum(n: number): string {
  return n.toLocaleString();
}

function fmtCost(n: number): string {
  return "$" + n.toFixed(4);
}

function getDateRange(filterType: FilterType, customFrom: string, customTo: string): { from: string; to: string } | null {
  switch (filterType) {
    case "today":
      return { from: getToday(), to: getToday() };
    case "week":
      return { from: getWeekStart(), to: getToday() };
    case "month":
      return { from: getMonthStart(), to: getToday() };
    case "custom":
      if (customFrom && customTo && customFrom <= customTo) {
        return { from: customFrom, to: customTo };
      }
      return null;
    default:
      return null;
  }
}

function rebuildModelStats(dailyUsage: DailyUsage[]): ModelStats[] {
  const map = new Map<string, { source: Source; model: string; requests: number; input_tokens: number; output_tokens: number; cache_read_tokens: number; cache_write_tokens: number; reasoning_tokens: number; cost: number }>();

  for (const day of dailyUsage) {
    for (const [key, val] of Object.entries(day.models)) {
      const model = key.includes("|") ? key.slice(key.indexOf("|") + 1) : key;
      const compositeKey = `${val.source}|${model}`;
      if (!map.has(compositeKey)) {
        map.set(compositeKey, { source: val.source, model, requests: 0, input_tokens: 0, output_tokens: 0, cache_read_tokens: 0, cache_write_tokens: 0, reasoning_tokens: 0, cost: 0 });
      }
      const entry = map.get(compositeKey)!;
      entry.requests += val.requests;
      entry.input_tokens += val.input_tokens;
      entry.output_tokens += val.output_tokens;
      entry.cache_read_tokens += val.cache_read_tokens ?? 0;
      entry.cache_write_tokens += val.cache_write_tokens ?? 0;
      entry.reasoning_tokens += val.reasoning_tokens ?? 0;
      entry.cost += val.cost;
    }
  }

  const totalCost = Array.from(map.values()).reduce((sum, e) => sum + e.cost, 0);

  return Array.from(map.values())
    .map((e) => ({
      ...e,
      total_tokens: e.input_tokens + e.output_tokens,
      cost_pct: totalCost > 0 ? (e.cost / totalCost) * 100 : 0,
      hasPricing: getModelCosts(e.model) !== null,
    }))
    .sort((a, b) => b.cost - a.cost);
}

const SOURCES: Source[] = ["opencode", "hermes", "claude-code"];
const SOURCE_LABELS: Record<Source, string> = {
  opencode: "Opencode",
  hermes: "Hermes",
  "claude-code": "Claude Code",
};
const SOURCE_COLORS: Record<Source, string> = {
  opencode: "#818cf8",
  hermes: "#4ade80",
  "claude-code": "#f472b6",
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
  const [filterType, setFilterType] = useState<FilterType>("none");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const dateRange = getDateRange(filterType, customFrom, customTo);
  const hasValidationError = filterType === "custom" && customFrom && customTo && customFrom > customTo;

  const {
    filteredDailyUsage,
    filteredDailySessions,
    filteredLatency,
    filteredModelStats,
    filteredTotalCost,
    filteredTotalTokens,
    filteredTotalRequests,
    filteredActiveModels,
    filteredSourceCosts,
    filteredSourceTokens,
  } = useMemo(() => {
    if (!dateRange || hasValidationError) {
      return {
        filteredDailyUsage: data.dailyUsage,
        filteredDailySessions: data.dailySessions,
        filteredLatency: data.latency,
        filteredModelStats: data.modelStats,
        filteredTotalCost: data.totalCost,
        filteredTotalTokens: data.totalTokens,
        filteredTotalRequests: data.totalRequests,
        filteredActiveModels: data.activeModels,
        filteredSourceCosts: data.sourceCosts,
        filteredSourceTokens: data.sourceTokens,
      };
    }

    const { from, to } = dateRange;

    const dailyUsage = data.dailyUsage.filter((d) => d.date >= from && d.date <= to);
    const dailySessions = data.dailySessions.filter((d) => d.date >= from && d.date <= to);
    const latency = data.latency.filter((d) => d.date >= from && d.date <= to);
    const modelStats = rebuildModelStats(dailyUsage);

    const totalCost = modelStats.reduce((sum, m) => sum + m.cost, 0);
    const totalTokens = modelStats.reduce((sum, m) => sum + m.total_tokens, 0);
    const totalRequests = modelStats.reduce((sum, m) => sum + m.requests, 0);
    const activeModels = modelStats.length;

    const sourceCosts: Record<Source, number> = { opencode: 0, hermes: 0, "claude-code": 0 };
    const sourceTokens: Record<Source, number> = { opencode: 0, hermes: 0, "claude-code": 0 };
    for (const m of modelStats) {
      sourceCosts[m.source] += m.cost;
      sourceTokens[m.source] += m.total_tokens;
    }

    return {
      filteredDailyUsage: dailyUsage,
      filteredDailySessions: dailySessions,
      filteredLatency: latency,
      filteredModelStats: modelStats,
      filteredTotalCost: totalCost,
      filteredTotalTokens: totalTokens,
      filteredTotalRequests: totalRequests,
      filteredActiveModels: activeModels,
      filteredSourceCosts: sourceCosts,
      filteredSourceTokens: sourceTokens,
    };
  }, [data, dateRange, hasValidationError]);

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
                Click Refresh to sync data from opencode, hermes, and claude-code.
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
            {/* Date Filter */}
            <DateFilter
              filterType={filterType}
              customFrom={customFrom}
              customTo={customTo}
              onFilterChange={setFilterType}
              onCustomFromChange={setCustomFrom}
              onCustomToChange={setCustomTo}
            />

            {/* Stat Cards */}
            <div
              className="responsive-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <StatCard
                label="Total Cost"
                value={fmtCost(filteredTotalCost)}
                subValue={`opencode: ${fmtCost(filteredSourceCosts?.opencode ?? 0)} / hermes: ${fmtCost(filteredSourceCosts?.hermes ?? 0)} / claude-code: ${fmtCost(filteredSourceCosts?.["claude-code"] ?? 0)}`}
              />
              <StatCard
                label="Total Tokens"
                value={fmtNum(filteredTotalTokens)}
                subValue={`opencode: ${fmtNum(filteredSourceTokens?.opencode ?? 0)} / hermes: ${fmtNum(filteredSourceTokens?.hermes ?? 0)} / claude-code: ${fmtNum(filteredSourceTokens?.["claude-code"] ?? 0)}`}
              />
              <StatCard label="Total Requests" value={fmtNum(filteredTotalRequests)} />
              <StatCard label="Active Models" value={filteredActiveModels} />
            </div>

            {/* Refresh */}
            <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
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
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                Aggregated usage per model across all sources
              </p>
              <ModelTable stats={filteredModelStats} />
            </div>

            {/* Charts — one section per source */}
            {SOURCES.filter((s) => filteredDailyUsage.some((d) => Object.values(d.models).some((m) => m.source === s))).map((source) => {
              const filtered = filterDailyBySource(filteredDailyUsage, source);
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
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                    Daily cost and token breakdown for {SOURCE_LABELS[source]} models
                  </p>
                  <div
                    className="responsive-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
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
                          marginBottom: "0.25rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Cost
                      </h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
                        Daily cost ($) per model over time
                      </p>
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
                          marginBottom: "0.25rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Tokens
                      </h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
                        Daily token usage (input, output, cache, reasoning)
                      </p>
                      <TokenChart dailyUsage={filtered} />
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
                          marginBottom: "0.25rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Tokens by Model
                      </h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
                        Total tokens per model (input, output, cache read)
                      </p>
                      <ModelTokenChart dailyUsage={filtered} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Sessions Over Time */}
            {filteredDailySessions.some((d) => d.opencode + d.hermes + d.claudeCode > 0) && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem", color: "var(--text-muted)" }}>
                  SESSIONS OVER TIME
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                  Number of sessions per day by source
                </p>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1rem" }}>
                  <SessionChart dailySessions={filteredDailySessions} />
                </div>
              </div>
            )}

            {/* Tool Usage */}
            {data.toolUsage.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem", color: "var(--text-muted)" }}>
                  TOOL USAGE
                  <span style={{ fontSize: "0.75rem", fontWeight: 400, marginLeft: "0.5rem", color: "var(--text-muted)" }}>(Hermes)</span>
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                  Top 10 most used tools by invocation count
                </p>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1rem" }}>
                  <ToolChart toolUsage={data.toolUsage} />
                </div>
              </div>
            )}

            {/* Hourly Activity */}
            {data.hourlyUsage.some((h) => h.count > 0) && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem", color: "var(--text-muted)" }}>
                  HOURLY ACTIVITY
                  <span style={{ fontSize: "0.75rem", fontWeight: 400, marginLeft: "0.5rem", color: "var(--text-muted)" }}>(Claude Code)</span>
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                  Message distribution by hour of day
                </p>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1rem" }}>
                  <HourlyChart hourlyUsage={data.hourlyUsage} />
                </div>
              </div>
            )}

            {/* Latency */}
            {filteredLatency.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem", color: "var(--text-muted)" }}>
                  RESPONSE LATENCY
                  <span style={{ fontSize: "0.75rem", fontWeight: 400, marginLeft: "0.5rem", color: "var(--text-muted)" }}>(OpenCode)</span>
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                  Average and P95 response time per day
                </p>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1rem" }}>
                  <LatencyChart latency={filteredLatency} />
                </div>
              </div>
            )}

            {/* Top Sessions */}
            {data.topSessions.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem", color: "var(--text-muted)" }}>
                  TOP SESSIONS BY COST
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                  Highest cost sessions across all sources
                </p>
                <TopSessionsTable topSessions={data.topSessions} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
