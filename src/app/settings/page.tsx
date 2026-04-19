"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ApiKeyForm from "@/components/ApiKeyForm";
import type { MaskedApiKey } from "@/lib/types";

export default function SettingsPage() {
  const [keys, setKeys] = useState<MaskedApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function fetchKeys() {
    try {
      const res = await fetch("/api/keys");
      if (!res.ok) throw new Error();
      setKeys(await res.json());
      setError(null);
    } catch {
      setError("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      setError("Failed to delete key");
    } finally {
      setDeleting(null);
    }
  }

  useEffect(() => {
    fetchKeys();
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
          <Link href="/" style={{ color: "var(--text-muted)" }}>Dashboard</Link>
          <Link href="/settings" style={{ color: "var(--accent)", fontWeight: 600 }}>Settings</Link>
        </div>
      </nav>

      <main style={{ padding: "1.5rem", maxWidth: "640px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <Link href="/" style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>← Back</Link>
        </div>

        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1.5rem" }}>API Keys</h1>

        {error && (
          <div style={{ color: "#f87171", background: "#2d1515", border: "1px solid #5c2a2a", borderRadius: "0.5rem", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        {/* Key List */}
        <div style={{ marginBottom: "2rem" }}>
          {loading ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading…</div>
          ) : keys.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "1rem 0" }}>No API keys configured yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {keys.map((key) => (
                <div
                  key={key.id}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{key.name}</span>
                      {key.is_active ? (
                        <span style={{ background: "#0f3d20", color: "#4ade80", fontSize: "0.7rem", padding: "0.1rem 0.45rem", borderRadius: "999px", fontWeight: 600 }}>
                          ACTIVE
                        </span>
                      ) : null}
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "monospace" }}>
                      {key.masked_key}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(key.id)}
                    disabled={deleting === key.id}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border)",
                      color: "#f87171",
                      borderRadius: "0.35rem",
                      padding: "0.3rem 0.7rem",
                      cursor: deleting === key.id ? "not-allowed" : "pointer",
                      fontSize: "0.8rem",
                      opacity: deleting === key.id ? 0.6 : 1,
                      flexShrink: 0,
                    }}
                  >
                    {deleting === key.id ? "…" : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Key Form */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          padding: "1.25rem",
        }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Add API Key</h2>
          <ApiKeyForm />
        </div>
      </main>
    </div>
  );
}
