"use client";

export type FilterType = "none" | "today" | "week" | "month" | "custom";

interface DateFilterProps {
  filterType: FilterType;
  customFrom: string;
  customTo: string;
  onFilterChange: (filterType: FilterType) => void;
  onCustomFromChange: (date: string) => void;
  onCustomToChange: (date: string) => void;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function getMonthStart(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function getDateRangeLabel(filterType: FilterType, customFrom: string, customTo: string): string {
  switch (filterType) {
    case "today":
      return `Showing: ${getToday()}`;
    case "week":
      return `Showing: ${getWeekStart()} → ${getToday()}`;
    case "month":
      return `Showing: ${getMonthStart()} → ${getToday()}`;
    case "custom":
      if (customFrom && customTo) return `Showing: ${customFrom} → ${customTo}`;
      return "";
    default:
      return "";
  }
}

function getDateValidationError(from: string, to: string): string | null {
  if (!from || !to) return null;
  return from > to ? "From date must be before or equal to To date" : null;
}

const selectStyle: React.CSSProperties = {
  background: "var(--surface-2)",
  color: "var(--text-primary)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.85rem",
  cursor: "pointer",
  outline: "none",
};

const dateInputStyle: React.CSSProperties = {
  background: "var(--surface-2)",
  color: "var(--text-primary)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.85rem",
  outline: "none",
  colorScheme: "dark",
};

const labelStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "0.8rem",
  fontWeight: 500,
};

export default function DateFilter({
  filterType,
  customFrom,
  customTo,
  onFilterChange,
  onCustomFromChange,
  onCustomToChange,
}: DateFilterProps) {
  const rangeLabel = getDateRangeLabel(filterType, customFrom, customTo);
  const validationError =
    filterType === "custom" ? getDateValidationError(customFrom, customTo) : null;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "0.75rem",
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          color: "var(--text-muted)",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontWeight: 600,
        }}
      >
        Date Filter
      </span>

      <select
        value={filterType}
        onChange={(e) => onFilterChange(e.target.value as FilterType)}
        style={selectStyle}
      >
        <option value="none">None</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="custom">Custom</option>
      </select>

      {filterType === "custom" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={labelStyle}>From</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => onCustomFromChange(e.target.value)}
              style={dateInputStyle}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={labelStyle}>To</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => onCustomToChange(e.target.value)}
              style={dateInputStyle}
            />
          </div>
        </>
      )}

      {validationError && (
        <span style={{ color: "#f87171", fontSize: "0.8rem" }}>{validationError}</span>
      )}

      {rangeLabel && !validationError && (
        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginLeft: "auto" }}>
          {rangeLabel}
        </span>
      )}
    </div>
  );
}
