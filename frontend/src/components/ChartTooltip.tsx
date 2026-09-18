import type { TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

interface ChartTooltipProps extends TooltipProps<ValueType, NameType> {
  labelFontSize?: string;
}

export const ChartTooltip = ({ active, payload, label, labelFontSize = ".75rem" }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: ".65rem .9rem", boxShadow: "var(--shadow-md)" }}>
      <p style={{ fontSize: labelFontSize, fontWeight: 700, color: "var(--text-3)", margin: "0 0 .25rem", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</p>
      <p style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--text)", margin: 0, fontFamily: "'DM Mono', monospace" }}>
        ₹{Number(payload[0]?.value ?? 0).toLocaleString()}
      </p>
    </div>
  );
};
