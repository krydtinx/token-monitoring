"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
}

export default function StatCard({ label, value, subValue }: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "0.75rem",
        padding: "1.25rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }}
    >
      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <span style={{ color: "var(--text-primary)", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.2 }}>
        {value}
      </span>
      {subValue && (
        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{subValue}</span>
      )}
    </div>
  );
}
