import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

type InsightsResponse = {
  success: boolean;
  insights: string[];
  month: string;
  cached: boolean;
};

// This month's spending, summarized into 3 short AI-written lines. The
// numbers behind them are always computed by the backend from the user's
// real expenses; the AI only turns those numbers into readable sentences.
// The backend caches the result for the month, so revisiting the dashboard
// doesn't trigger another AI call.
export const InsightsCard = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["monthly-insights"],
    queryFn: async () => {
      const res = await axiosInstance.get("/ai/insights");
      return res.data as InsightsResponse;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="chart-card h-100">
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title">This Month's Insights</div>
          <div className="chart-card-sub">AI-generated from your real numbers</div>
        </div>
        <div
          style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}
        >
          <i className="bi bi-stars" />
        </div>
      </div>

      {isPending ? (
        <div className="pt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton mb-3" style={{ height: 14, width: `${88 - i * 12}%` }} />
          ))}
        </div>
      ) : isError || !data?.insights?.length ? (
        <div className="empty-state" style={{ padding: "1.5rem 0" }}>
          <div className="empty-icon" style={{ margin: "0 auto .5rem" }}>
            <i className="bi bi-stars" />
          </div>
          <p style={{ fontSize: ".82rem" }}>Add a few expenses to see insights.</p>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: ".65rem" }}>
          {data.insights.map((insight, i) => (
            <li key={i} style={{ display: "flex", gap: ".6rem", fontSize: ".85rem", color: "var(--text-2)", lineHeight: 1.45 }}>
              <i className="bi bi-check-circle-fill" style={{ color: "var(--accent)", marginTop: "3px", flexShrink: 0, fontSize: ".8rem" }} />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
