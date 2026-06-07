import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTitle } from "react-use";
import moment from "moment";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, Cell,
} from "recharts";
import axiosInstance from "@/lib/axios";
import { Loading } from "@/components/Loading";
import { ReportData, ReportType } from "@/types/report";

const BAR_COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#06b6d4","#a855f7","#ec4899","#14b8a6"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: ".65rem .9rem", boxShadow: "var(--shadow-md)" }}>
      <p style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--text-3)", margin: "0 0 .25rem", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</p>
      <p style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--text)", margin: 0, fontFamily: "'DM Mono', monospace" }}>
        ₹{Number(payload[0].value).toLocaleString()}
      </p>
    </div>
  );
};

const Report = () => {
  useTitle("Expensify — Analytics");
  const [type, setType] = useState<ReportType>("monthly");

  const { isPending, data } = useQuery({
    queryKey: ["user-report", type],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/premium/report?type=${type}`);
      return data as ReportData[];
    },
  });

  const totalAmount = data?.reduce((t, i) => t + i.amount, 0) ?? 0;
  const avgAmount = data?.length ? Math.round(totalAmount / data.length) : 0;
  const peakItem = data?.reduce((max, item) => item.amount > max.amount ? item : max, data[0]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      name: item.label ?? item._id,
      amount: item.amount,
    }));
  }, [data]);

  if (isPending) return <Loading />;

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <h4>Analytics</h4>
        <p>
          {type === "monthly" && `Expenses for ${moment().format("MMMM YYYY")}`}
          {type === "weekly" && "Last 7 days breakdown"}
          {type === "yearly" && `Yearly overview for ${moment().format("YYYY")}`}
        </p>
      </div>

      {/* Period tabs + controls */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="pill-tabs">
          {(["weekly", "monthly", "yearly"] as ReportType[]).map((t) => (
            <button
              key={t}
              className={`pill-tab ${type === t ? "active" : ""}`}
              onClick={() => setType(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ fontSize: ".78rem", color: "var(--text-3)" }}>
          <i className="bi bi-clock-history me-1" />
          Last updated just now
        </div>
      </div>

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="stat-card">
            <div className="d-flex align-items-start justify-content-between">
              <div>
                <div className="stat-label">Total Spent</div>
                <div className="stat-value mono">₹{totalAmount.toLocaleString()}</div>
                <div className="stat-sub">{type} total</div>
              </div>
              <div className="stat-icon" style={{ background: "rgba(79,70,229,.08)", color: "var(--primary)" }}>
                <i className="bi bi-wallet2" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="stat-card">
            <div className="d-flex align-items-start justify-content-between">
              <div>
                <div className="stat-label">Avg per Entry</div>
                <div className="stat-value mono">₹{avgAmount.toLocaleString()}</div>
                <div className="stat-sub">{data?.length ?? 0} entries</div>
              </div>
              <div className="stat-icon" style={{ background: "rgba(16,185,129,.08)", color: "var(--accent)" }}>
                <i className="bi bi-bar-chart-fill" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="stat-card">
            <div className="d-flex align-items-start justify-content-between">
              <div>
                <div className="stat-label">Peak Period</div>
                <div style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--text)", marginTop: ".3rem" }}>
                  {peakItem?.label ?? peakItem?._id ?? "—"}
                </div>
                {peakItem && (
                  <div className="stat-sub down">
                    <i className="bi bi-arrow-up" style={{ fontSize: ".7rem" }} />
                    ₹{peakItem.amount.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="stat-icon" style={{ background: "rgba(245,158,11,.08)", color: "var(--warning)" }}>
                <i className="bi bi-fire" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {data?.length === 0 ? (
        <div className="chart-card">
          <div className="empty-state">
            <div className="empty-icon">
              <i className="bi bi-bar-chart-line" />
            </div>
            <h6>No Data Available</h6>
            <p>Add expenses from the Dashboard to see analytics here.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-3 analytics-charts-row">
            {/* Bar chart */}
            <div className="col-lg-6">
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Expense Breakdown</div>
                    <div className="chart-card-sub">Spending by period</div>
                  </div>
                  <div style={{ fontSize: ".72rem", color: "var(--text-3)" }}>Bar Chart</div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.9} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line chart */}
            <div className="col-lg-6">
              <div className="chart-card">
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">Spending Trend</div>
                    <div className="chart-card-sub">Amount over time</div>
                  </div>
                  <div style={{ fontSize: ".72rem", color: "var(--text-3)" }}>Line Chart</div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: ".72rem" }} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                      name="Amount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed table */}
          <div className="table-wrap">
            <div
              style={{ padding: ".85rem 1.25rem", borderBottom: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div style={{ fontWeight: 700, fontSize: ".85rem", color: "var(--text)" }}>
                <i className="bi bi-table me-2" style={{ color: "var(--primary)" }} />
                Detailed Breakdown
              </div>
              <div style={{ fontSize: ".72rem", color: "var(--text-3)" }}>{data?.length} entries</div>
            </div>
            <div className="table-responsive">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Period</th>
                    <th>Amount</th>
                    <th style={{ minWidth: 160 }}>Share of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((item, i) => {
                    const pct = totalAmount ? ((item.amount / totalAmount) * 100).toFixed(1) : "0";
                    const label = item.label ?? item._id;
                    return (
                      <tr key={i}>
                        <td style={{ color: "var(--text-4)", fontSize: ".75rem", fontFamily: "'DM Mono', monospace" }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{label}</td>
                        <td>
                          <span className="amount-cell negative">₹{item.amount.toLocaleString()}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{ flex: 1 }}>
                              <div className="budget-track">
                                <div
                                  className="budget-fill"
                                  style={{
                                    width: `${pct}%`,
                                    background: BAR_COLORS[i % BAR_COLORS.length],
                                  }}
                                />
                              </div>
                            </div>
                            <span style={{ fontSize: ".72rem", color: "var(--text-3)", whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace", minWidth: 36, textAlign: "right" }}>
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Report;
