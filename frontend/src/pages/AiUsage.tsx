import { useQuery } from "@tanstack/react-query";
import { useTitle } from "react-use";
import axiosInstance from "@/lib/axios";

type AiStat = {
  feature: string;
  count: number;
  successRate: number;
  avgTokens: number | null;
  avgResponseTimeMs: number | null;
};

const FEATURE_LABELS: Record<string, string> = {
  receipt_scan: "Receipt Scanning",
  voice_parse: "Voice Logging",
  ask_spending: "Ask Your Spending",
  monthly_insights: "Monthly Insights",
};

const FEATURE_ICONS: Record<string, string> = {
  receipt_scan: "bi-camera-fill",
  voice_parse: "bi-mic-fill",
  ask_spending: "bi-chat-dots-fill",
  monthly_insights: "bi-stars",
};

// Every Gemini call in the app is logged to the ai_logs collection (feature,
// tokens used, response time, success/failure). This page just aggregates
// those rows so cost and speed are visible from real data instead of a
// hunch. Read-only, no per-user financial data — in production this should
// sit behind a real admin role rather than any logged-in user.
const AiUsage = () => {
  useTitle("SpendWise — AI Usage");

  const { data, isPending } = useQuery({
    queryKey: ["ai-admin-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/ai/admin/stats");
      return res.data as { success: boolean; stats: AiStat[] };
    },
  });

  const stats = data?.stats ?? [];

  return (
    <>
      <div className="page-header">
        <h4>AI Usage</h4>
        <p>Cost and speed across every AI feature, logged per call</p>
      </div>

      <div className="table-wrap">
        {isPending ? (
          <div className="p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="d-flex gap-3 mb-3 align-items-center">
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton mb-1" style={{ height: 12, width: "40%" }} />
                  <div className="skeleton" style={{ height: 10, width: "25%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : stats.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="bi bi-cpu" />
            </div>
            <h6>No AI calls logged yet</h6>
            <p>Scan a receipt, log by voice, or ask a spending question to see numbers here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Calls</th>
                  <th>Success Rate</th>
                  <th>Avg Tokens</th>
                  <th>Avg Response Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.feature}>
                    <td>
                      <span className="cat-badge" style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>
                        <i className={`bi ${FEATURE_ICONS[s.feature] ?? "bi-cpu"}`} style={{ fontSize: ".7rem" }} />
                        {FEATURE_LABELS[s.feature] ?? s.feature}
                      </span>
                    </td>
                    <td>{s.count}</td>
                    <td>
                      <span style={{ color: s.successRate >= 0.9 ? "var(--accent)" : s.successRate >= 0.5 ? "var(--warning, #f59e0b)" : "var(--danger)", fontWeight: 700 }}>
                        {Math.round(s.successRate * 100)}%
                      </span>
                    </td>
                    <td>{s.avgTokens ?? "—"}</td>
                    <td>{s.avgResponseTimeMs != null ? `${s.avgResponseTimeMs.toLocaleString()} ms` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AiUsage;
