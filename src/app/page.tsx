"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import ModelTable from "@/components/ModelTable";
import CostChart from "@/components/CostChart";
import TokenChart from "@/components/TokenChart";
import type { DashboardData } from "@/lib/types";

function fmtNum(n: number): string {
  return n.toLocaleString();
}

function fmtCost(n: number): string {
  return "$" + n.toFixed(4);
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      const res = await fetch("/api/usage");
      if (!res.ok) throw new Error("Failed to fetch");
      setData(await res.json());
      setError(null);
    } catch {
      setError("Failed to load usage data. Make sure you have an API key configured.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/usage/refresh", { method: "POST" });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Refresh failed");
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text-primary)" }}>
      {/* Nav */}
      <nav style={{
        borderBottom: "1px solid var(--border)",
        padding: "0.75rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        background: "var(--surface)",
      }}>
        <span style={{ fontWeight: 700, fontSize: "1rem" }}>Token Usage</span>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/" style={{ color: "var(--accent)", fontWeight: 600 }}>Dashboard</Link>
          <Link href="/settings" style={{ color: "var(--text-muted)" }}>Settings</Link>
        </div>
      </nav>

      <main style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", height: "90px", animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : data && data.modelStats.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "1rem" }}>No usage data yet</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Go to <Link href="/settings" style={{ color: "var(--accent)" }}>Settings</Link> to add your OpenRouter API key, then click Refresh.
            </p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <StatCard label="Total Cost" value={data ? fmtCost(data.totalCost) : "—"} subValue="all time" />
              <StatCard label="Total Tokens" value={data ? fmtNum(data.totalTokens) : "—"} subValue="input + output" />
              <StatCard label="Total Requests" value={data ? fmtNum(data.totalRequests) : "—"} />
              <StatCard label="Active Models" value={data ? data.activeModels : "—"} />
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
                {refreshing ? "Refreshing…" : "↻ Refresh"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "#2d1515", border: "1px solid #5c2a2a", borderRadius: "0.5rem", padding: "0.75rem 1rem", marginBottom: "1rem", color: "#f87171", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            {/* Model Table */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text-muted)" }}>BY MODEL</h2>
              <ModelTable stats={data?.modelStats ?? []} />
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1rem" }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1rem" }}>
                <h2 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text-muted)" }}>COST OVER TIME</h2>
                <CostChart dailyUsage={data?.dailyUsage ?? []} />
              </div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1rem" }}>
                <h2 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text-muted)" }}>TOKENS OVER TIME</h2>
                <TokenChart dailyUsage={data?.dailyUsage ?? []} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
