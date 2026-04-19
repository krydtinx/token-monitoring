"use client";

import { useState, FormEvent } from "react";

export default function ApiKeyForm() {
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, key: apiKey }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to add key");
      }

      setName("");
      setApiKey("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add key");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "0.5rem",
    padding: "0.6rem 0.875rem",
    color: "var(--text-primary)",
    fontSize: "0.875rem",
    outline: "none",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      <div>
        <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
          Key Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. opencode-go"
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
          OpenRouter API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-or-..."
          required
          style={inputStyle}
        />
      </div>

      {error && (
        <div style={{ color: "#f87171", fontSize: "0.85rem", background: "#2d1515", border: "1px solid #5c2a2a", borderRadius: "0.4rem", padding: "0.5rem 0.75rem" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ color: "#4ade80", fontSize: "0.85rem", background: "#0f2d1a", border: "1px solid #1a5c2a", borderRadius: "0.4rem", padding: "0.5rem 0.75rem" }}>
          Key added successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: "0.5rem",
          padding: "0.6rem 1.25rem",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "0.875rem",
          fontWeight: 600,
          alignSelf: "flex-start",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Adding…" : "Add Key"}
      </button>
    </form>
  );
}
