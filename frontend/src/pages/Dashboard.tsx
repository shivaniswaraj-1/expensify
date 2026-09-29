import { useState, useMemo, useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTitle, useDebounce } from "react-use";
import moment from "moment";
import CountUp from "react-countup";
import { toast } from "react-toastify";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";
import axiosInstance from "@/lib/axios";
import EditExpenseDialog from "@/overlays/EditExpenseDialog";
import DeleteDialog from "@/overlays/DeleteDialog";
import useOverlayStore from "@/hooks/useOverlayStore";
import { ChartTooltip } from "@/components/ChartTooltip";
import { BudgetSection } from "@/components/BudgetSection";
import { InsightsCard } from "@/components/InsightsCard";
import { AskSpendingCard } from "@/components/AskSpendingCard";
import { CATEGORIES } from "@/constants/categories";
import { useVoiceInput, type VoiceLang } from "@/hooks/useVoiceInput";

// ── Constants ──────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  "Mobile & Computers":"#6366f1","Books & Education":"#06b6d4",
  "Sports, Outdoor & Travel":"#10b981","Bills & EMI's":"#f59e0b",
  "Groceries & Pet Supplies":"#ef4444","Fashion & Beauty":"#ec4899",
  "Gifts & Donations":"#8b5cf6","Investments":"#14b8a6",
  "Insurance":"#f97316","Entertainment":"#a855f7",
  "Home & Utilities":"#3b82f6","Hobbies & Leisure":"#84cc16",
};

const CAT_ICONS: Record<string, string> = {
  "Mobile & Computers":"bi-phone-fill","Books & Education":"bi-book-fill",
  "Sports, Outdoor & Travel":"bi-bicycle","Bills & EMI's":"bi-receipt-cutoff",
  "Groceries & Pet Supplies":"bi-basket-fill","Fashion & Beauty":"bi-bag-heart-fill",
  "Gifts & Donations":"bi-gift-fill","Investments":"bi-graph-up-arrow",
  "Insurance":"bi-shield-check","Entertainment":"bi-controller",
  "Home & Utilities":"bi-house-fill","Hobbies & Leisure":"bi-palette-fill",
};

const PIE_FALLBACK = ["#6366f1","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#8b5cf6","#14b8a6","#f97316","#a855f7","#3b82f6","#84cc16"];

// ── Main Dashboard ──────────────────────────────────────────────
const Dashboard = () => {
  useTitle("SpendWise — Dashboard");
  const queryClient = useQueryClient();
  const { onOpen } = useOverlayStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1");
  const [rows, setRows] = useState<number>(() => JSON.parse(localStorage.getItem("rows") ?? "10"));
  // Seeded from ?search=... so arriving from the topbar search box shows
  // results immediately instead of waiting for the debounce below to fire.
  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") ?? "");
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [filterCat, setFilterCat] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const { register, handleSubmit, reset, setValue } = useForm();
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const [voiceLang, setVoiceLangState] = useState<VoiceLang>(
    () => (localStorage.getItem("voiceLang") as VoiceLang | null) ?? "hi-IN"
  );
  const setVoiceLang = (lang: VoiceLang) => {
    setVoiceLangState(lang);
    localStorage.setItem("voiceLang", lang);
  };
  const { isSupported: voiceSupported, isListening, start: startListening } = useVoiceInput(voiceLang);

  // Debounce the search box so we don't hit the API on every keystroke, and
  // send the user back to page 1 once a new search actually takes effect
  // (skipping that reset on first mount, e.g. when deep-linking to a page).
  const isFirstSearchRun = useRef(true);
  useDebounce(
    () => {
      setSearch(searchInput);
      if (isFirstSearchRun.current) {
        isFirstSearchRun.current = false;
        return;
      }
      if (currentPage !== 1) navigate("/dashboard?page=1");
    },
    400,
    [searchInput]
  );

  const goToFirstPage = () => {
    if (currentPage !== 1) navigate("/dashboard?page=1");
  };

  const toggleSortDir = () => {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    goToFirstPage();
  };

  // Paginated data for table — search/category/sort are applied on the
  // backend, before pagination, so results are correct across every page,
  // not just the currently loaded one.
  const { isPending, data } = useQuery({
    queryKey: ["user-expenses", { currentPage, rows, search, filterCat, sortDir }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(currentPage),
        rows: String(rows),
        sortDir,
      });
      if (search) params.set("search", search);
      if (filterCat) params.set("category", filterCat);

      const res = await axiosInstance.get(`/expense/?${params.toString()}`);
      const d = res.data as DashboardData;
      navigate(`/dashboard?page=${d.currentPage}`, { replace: true });
      return d;
    },
  });

  // All data for stats & charts
  const { data: allData } = useQuery({
    queryKey: ["all-expenses-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/expense/?page=1&rows=1000`);
      return res.data as DashboardData;
    },
  });

  const allExpenses = allData?.expenses ?? [];

  // Stats
  const totalExpense = useMemo(() => allExpenses.reduce((s, e) => s + e.amount, 0), [allExpenses]);
  const thisMonth = useMemo(() => {
    const m = moment().format("YYYY-MM");
    return allExpenses.filter((e) => moment(e.date ?? e.createdAt).format("YYYY-MM") === m).reduce((s, e) => s + e.amount, 0);
  }, [allExpenses]);
  const lastMonth = useMemo(() => {
    const m = moment().subtract(1, "month").format("YYYY-MM");
    return allExpenses.filter((e) => moment(e.date ?? e.createdAt).format("YYYY-MM") === m).reduce((s, e) => s + e.amount, 0);
  }, [allExpenses]);
  const thisMonthCount = useMemo(() => {
    const m = moment().format("YYYY-MM");
    return allExpenses.filter((e) => moment(e.date ?? e.createdAt).format("YYYY-MM") === m).length;
  }, [allExpenses]);
  const highestCat = useMemo(() => {
    const map: Record<string, number> = {};
    allExpenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [allExpenses]);

  const monthChange = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

  // Chart data
  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    allExpenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [allExpenses]);

  const trendData = useMemo(() => {
    const map: Record<string, number> = {};
    allExpenses.forEach((e) => {
      const day = moment(e.date ?? e.createdAt).format("DD MMM");
      map[day] = (map[day] || 0) + e.amount;
    });
    return Object.entries(map)
      .slice(-14)
      .map(([name, amount]) => ({ name, amount }));
  }, [allExpenses]);

  // The backend already returns this page pre-filtered and pre-sorted.
  const expenses = data?.expenses ?? [];

  const createExpense = useMutation({
    mutationFn: (formData: Record<string, unknown>) =>
      axiosInstance.post("/expense", receiptUrl ? { ...formData, receiptUrl } : formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["all-expenses-stats"] });
      reset();
      setValue("date", moment().format("YYYY-MM-DD"));
      setReceiptUrl(null);
      toast.success("Expense added successfully!");
    },
    onError: () => toast.error("Failed to add expense. Please try again."),
  });

  const onSubmit = (data: Record<string, unknown>) => createExpense.mutate(data);

  // Receipt scanning: upload a photo, let Gemini (via the backend) pre-fill
  // the same Add Expense form below, then the user confirms or edits before
  // it's actually saved.
  const scanReceipt = useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append("receipt", file);
      return axiosInstance.post("/receipts/scan", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (res) => {
      const { success, extracted, receiptUrl: url, message } = res.data as {
        success: boolean;
        extracted?: { amount: number; category: string; merchant: string; date?: string };
        receiptUrl: string | null;
        message?: string;
      };
      if (url) setReceiptUrl(url);

      if (success && extracted) {
        setValue("amount", extracted.amount);
        if (CATEGORIES.includes(extracted.category as (typeof CATEGORIES)[number])) {
          setValue("category", extracted.category);
        }
        setValue("description", extracted.merchant);
        if (extracted.date && moment(extracted.date).isValid()) {
          setValue("date", moment(extracted.date).format("YYYY-MM-DD"));
        }
        toast.success("Receipt scanned! Review the details below.");
      } else {
        toast.info(message || "Couldn't read this receipt, please fill it in.");
      }
    },
    onError: () => toast.error("Couldn't scan the receipt. Please fill the form manually."),
  });

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) scanReceipt.mutate(file);
  };

  // Voice logging: the browser turns speech into text, the backend asks
  // Gemini to turn that transcript (Hindi/English/Hinglish) into the same
  // shape as a receipt extraction, and it pre-fills this same form.
  const parseVoice = useMutation({
    mutationFn: (transcript: string) => axiosInstance.post("/voice/parse", { transcript }),
    onSuccess: (res) => {
      const { success, extracted, message } = res.data as {
        success: boolean;
        extracted?: { amount: number; category: string; note: string; date?: string };
        message?: string;
      };

      if (success && extracted) {
        setValue("amount", extracted.amount);
        if (CATEGORIES.includes(extracted.category as (typeof CATEGORIES)[number])) {
          setValue("category", extracted.category);
        }
        setValue("description", extracted.note);
        if (extracted.date && moment(extracted.date).isValid()) {
          setValue("date", moment(extracted.date).format("YYYY-MM-DD"));
        }
        toast.success("Got it! Review the details below.");
      } else {
        toast.info(message || "Couldn't understand that, please fill it in.");
      }
    },
    onError: () => toast.error("Couldn't process that. Please fill the form manually."),
  });

  const handleMicClick = () => {
    if (isListening || parseVoice.isPending) return;
    startListening(
      (transcript) => parseVoice.mutate(transcript),
      (message) => toast.error(message)
    );
  };

  const handlePrev = () => { if (currentPage > 1) navigate(`/dashboard?page=${currentPage - 1}`); };
  const handleNext = () => { if (data && currentPage < data.totalPages) navigate(`/dashboard?page=${currentPage + 1}`); };
  const handleRowChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = parseInt(e.target.value);
    setRows(v);
    localStorage.setItem("rows", JSON.stringify(v));
    const tp = Math.ceil((data?.totalItems || 0) / v);
    navigate(`/dashboard?page=${Math.min(currentPage, tp || 1)}`);
  };

  return (
    <>
      {/* ── Page Header ── */}
      <div className="page-header">
        <h4>Dashboard</h4>
        <p>Track, analyze, and manage your spending at a glance</p>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="row g-3 mb-4 stat-cards-row">
        <div className="col-6 col-lg-3">
          <div className="stat-card h-100">
            <div className="d-flex align-items-start justify-content-between">
              <div>
                <div className="stat-label">Total Spent</div>
                <div className="stat-value mono">
                  ₹<CountUp end={totalExpense} separator="," duration={1.2} />
                </div>
                <div className="stat-sub">
                  <i className="bi bi-receipt" style={{ fontSize: ".7rem" }} />
                  {allExpenses.length} transactions
                </div>
              </div>
              <div className="stat-icon stat-icon-primary">
                <i className="bi bi-wallet2" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stat-card h-100">
            <div className="d-flex align-items-start justify-content-between">
              <div>
                <div className="stat-label">This Month</div>
                <div className="stat-value mono">
                  ₹<CountUp end={thisMonth} separator="," duration={1.2} />
                </div>
                <div className="stat-sub">
                  {monthChange !== 0 && (
                    <span className={monthChange > 0 ? "down" : "up"}>
                      <i className={`bi bi-arrow-${monthChange > 0 ? "up" : "down"}`} style={{ fontSize: ".7rem" }} />
                      {Math.abs(monthChange)}% vs last month
                    </span>
                  )}
                  {monthChange === 0 && <span>{thisMonthCount} transactions</span>}
                </div>
              </div>
              <div className="stat-icon stat-icon-accent">
                <i className="bi bi-calendar-check" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="stat-card h-100">
            <div className="d-flex align-items-start justify-content-between">
              <div>
                <div className="stat-label">Top Category</div>
                <div style={{ fontWeight: 700, fontSize: ".9rem", marginTop: ".3rem", color: "var(--text)" }}>
                  {highestCat !== "—" ? (
                    <span
                      className="cat-badge"
                      style={{
                        background: `${CAT_COLORS[highestCat] ?? "#6366f1"}18`,
                        color: CAT_COLORS[highestCat] ?? "#6366f1",
                        fontSize: ".78rem",
                      }}
                    >
                      <i className={`bi ${CAT_ICONS[highestCat] ?? "bi-tag"}`} style={{ fontSize: ".75rem" }} />
                      {highestCat}
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-3)", fontWeight: 400 }}>No data</span>
                  )}
                </div>
                <div className="stat-sub">Highest spend area</div>
              </div>
              <div className="stat-icon stat-icon-warning">
                <i className="bi bi-fire" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <BudgetSection totalExpense={thisMonth} />
        </div>
      </div>

      {/* ── AI: INSIGHTS + ASK YOUR SPENDING ── */}
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <InsightsCard />
        </div>
        <div className="col-lg-6">
          <AskSpendingCard />
        </div>
      </div>

      {/* ── CHARTS + FORM ── */}
      <div className="row g-3 mb-4 charts-form-row">
        {/* Pie chart */}
        <div className="col-lg-4">
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Spending by Category</div>
                <div className="chart-card-sub">Top 6 categories</div>
              </div>
            </div>
            {pieData.length === 0 ? (
              <div className="empty-state" style={{ padding: "2rem 0" }}>
                <div className="empty-icon" style={{ margin: "0 auto .75rem" }}>
                  <i className="bi bi-pie-chart" />
                </div>
                <p style={{ fontSize: ".82rem" }}>Add expenses to see breakdown</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {pieData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={CAT_COLORS[entry.name] ?? PIE_FALLBACK[i % PIE_FALLBACK.length]}
                      />
                    ))}
                  </Pie>
                  <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 10, fontWeight: 700, fill: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Total
                  </text>
                  <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 15, fontWeight: 800, fill: "var(--text)", fontFamily: "'DM Mono', monospace" }}>
                    ₹{totalExpense >= 100000 ? `${(totalExpense / 100000).toFixed(1)}L` : totalExpense.toLocaleString()}
                  </text>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0];
                      return (
                        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: ".6rem .9rem", boxShadow: "var(--shadow-md)" }}>
                          <div style={{ fontSize: ".72rem", color: "var(--text-3)", fontWeight: 600, marginBottom: ".2rem" }}>{item.name}</div>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "var(--text)" }}>₹{Number(item.value).toLocaleString()}</div>
                        </div>
                      );
                    }}
                  />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: ".72rem", paddingTop: ".5rem" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Trend chart */}
        <div className="col-lg-4">
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Spending Trend</div>
                <div className="chart-card-sub">Last 14 days</div>
              </div>
            </div>
            {trendData.length === 0 ? (
              <div className="empty-state" style={{ padding: "2rem 0" }}>
                <div className="empty-icon" style={{ margin: "0 auto .75rem" }}>
                  <i className="bi bi-graph-up" />
                </div>
                <p style={{ fontSize: ".82rem" }}>No recent activity</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#areaGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#6366f1" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Add expense form */}
        <div className="col-lg-4">
          <div className="form-card h-100">
            <div className="chart-card-header mb-3">
              <div>
                <div className="chart-card-title">Add Expense</div>
                <div className="chart-card-sub">Record a new transaction</div>
              </div>
              <div
                style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}
              >
                <i className="bi bi-plus-lg" />
              </div>
            </div>

            <input
              ref={receiptInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleReceiptChange}
              hidden
            />
            <button
              type="button"
              className="btn btn-ghost w-100 mb-3"
              onClick={() => receiptInputRef.current?.click()}
              disabled={scanReceipt.isPending}
              style={{ justifyContent: "center", gap: ".5rem", border: "1px dashed var(--border)" }}
            >
              {scanReceipt.isPending ? (
                <><span className="spinner-border spinner-border-sm" /> Reading receipt...</>
              ) : receiptUrl ? (
                <><i className="bi bi-check-circle-fill" style={{ color: "#10b981" }} /> Receipt attached — scan another?</>
              ) : (
                <><i className="bi bi-camera-fill" /> Scan a receipt</>
              )}
            </button>

            <div className={`d-flex gap-2${voiceSupported ? " mb-3" : " mb-1"}`}>
              <button
                type="button"
                className={`btn btn-ghost flex-grow-1${isListening ? " mic-listening" : ""}`}
                onClick={handleMicClick}
                disabled={!voiceSupported || isListening || parseVoice.isPending}
                style={{ justifyContent: "center", gap: ".5rem", border: "1px dashed var(--border)" }}
              >
                {isListening ? (
                  <><span className="mic-pulse-dot" /> Listening...</>
                ) : parseVoice.isPending ? (
                  <><span className="spinner-border spinner-border-sm" /> Processing...</>
                ) : (
                  <><i className="bi bi-mic-fill" /> Voice log</>
                )}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                title={voiceLang === "hi-IN" ? "Listening in Hindi/Hinglish — tap to switch to English" : "Listening in English — tap to switch to Hindi/Hinglish"}
                onClick={() => setVoiceLang(voiceLang === "hi-IN" ? "en-IN" : "hi-IN")}
                disabled={!voiceSupported}
                style={{ width: "auto", padding: "0 .7rem", fontSize: ".72rem", fontWeight: 700 }}
              >
                {voiceLang === "hi-IN" ? "हिं" : "EN"}
              </button>
            </div>
            {!voiceSupported && (
              <div className="mb-3" style={{ fontSize: ".72rem", color: "var(--text-4)" }}>
                Voice input works best in Chrome — please use Chrome or fill the form manually.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row g-2 mb-3 expense-form-row">
                <div className="col-6">
                  <label className="form-label">Amount (₹)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="0"
                    required
                    autoComplete="off"
                    min="1"
                    {...register("amount")}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Category</label>
                  <select className="form-select" required {...register("category")}>
                    <option value="">Select</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Date</label>
                <input
                  className="form-control"
                  type="date"
                  required
                  max={moment().format("YYYY-MM-DD")}
                  defaultValue={moment().format("YYYY-MM-DD")}
                  {...register("date")}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <input
                  className="form-control"
                  placeholder="What did you spend on?"
                  required
                  autoComplete="off"
                  {...register("description")}
                />
              </div>
              <button
                className="btn-primary-lg w-100"
                type="submit"
                disabled={createExpense.isPending}
                style={{ justifyContent: "center" }}
              >
                {createExpense.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-lg" />
                    Add Expense
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── EXPENSE TABLE ── */}
      <div className="table-wrap">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="search-wrap" style={{ maxWidth: 280 }}>
            <i className="bi bi-search" />
            <input
              className="form-control"
              placeholder="Search expenses..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: "auto", minWidth: 160 }}
            value={filterCat}
            onChange={(e) => { setFilterCat(e.target.value); goToFirstPage(); }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            className="btn btn-ghost btn-sm"
            onClick={toggleSortDir}
          >
            <i className={`bi bi-sort-numeric-${sortDir === "asc" ? "up" : "down"}`} />
            Amount
          </button>

          <div style={{ marginLeft: "auto", fontSize: ".75rem", color: "var(--text-3)" }}>
            {data && (
              <span>
                {data.totalItems} {data.totalItems === 1 ? "result" : "results"}
              </span>
            )}
          </div>
        </div>

        {/* Table body */}
        {isPending ? (
          <div className="p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="d-flex gap-3 mb-3 align-items-center">
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton mb-1" style={{ height: 12, width: "60%" }} />
                  <div className="skeleton" style={{ height: 10, width: "35%" }} />
                </div>
                <div className="skeleton" style={{ width: 70, height: 12 }} />
              </div>
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="bi bi-receipt" />
            </div>
            <h6>No expenses found</h6>
            <p>
              {searchInput || filterCat
                ? "Try adjusting your search or filters."
                : "Add your first expense using the form above."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th className="table-col-hide-mobile">Description</th>
                  <th className="sortable" onClick={toggleSortDir}>
                    Amount <i className={`bi bi-chevron-${sortDir === "asc" ? "up" : "down"}`} style={{ fontSize: ".65rem" }} />
                  </th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, i) => (
                  <tr key={exp._id}>
                    <td style={{ color: "var(--text-4)", fontSize: ".75rem", fontFamily: "'DM Mono', monospace" }}>
                      {(currentPage - 1) * rows + i + 1}
                    </td>
                    <td style={{ whiteSpace: "nowrap", color: "var(--text-3)", fontSize: ".8rem" }}>
                      {moment(exp.date ?? exp.createdAt).format("DD MMM YYYY")}
                    </td>
                    <td>
                      <span
                        className="cat-badge"
                        style={{
                          background: `${CAT_COLORS[exp.category] ?? "#6366f1"}15`,
                          color: CAT_COLORS[exp.category] ?? "#6366f1",
                        }}
                      >
                        <i className={`bi ${CAT_ICONS[exp.category] ?? "bi-tag"}`} style={{ fontSize: ".7rem" }} />
                        {exp.category}
                      </span>
                    </td>
                    <td className="table-col-hide-mobile" style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {exp.description}
                    </td>
                    <td>
                      <span className="amount-cell negative">₹{exp.amount.toLocaleString()}</span>
                    </td>
                    <td>
                      <div className="d-flex gap-1 justify-content-center">
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => onOpen("EDIT_DIALOG", exp)}
                          title="Edit"
                          style={{ color: "var(--primary)" }}
                        >
                          <i className="bi bi-pencil-fill" style={{ fontSize: ".8rem" }} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => onOpen("DELETE_DIALOG", exp._id)}
                          title="Delete"
                          style={{ color: "var(--danger)" }}
                        >
                          <i className="bi bi-trash-fill" style={{ fontSize: ".8rem" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 0 && (
          <div className="table-footer">
            <div className="table-meta">
              Page {currentPage} of {data.totalPages} &bull; {data.totalItems} total
            </div>
            <div className="d-flex align-items-center gap-2">
              <select
                className="form-select form-select-sm"
                style={{ width: "auto" }}
                value={rows}
                onChange={handleRowChange}
              >
                {[5, 10, 15, 20, 50].map((r) => (
                  <option key={r} value={r}>{r} / page</option>
                ))}
              </select>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={handlePrev} disabled={currentPage === 1}>
                <i className="bi bi-chevron-left" />
              </button>
              <span style={{ fontSize: ".8rem", color: "var(--text-3)", minWidth: 24, textAlign: "center", fontFamily: "'DM Mono', monospace" }}>
                {currentPage}
              </span>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={handleNext} disabled={currentPage === data.totalPages}>
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      <EditExpenseDialog />
      <DeleteDialog />
    </>
  );
};

export default Dashboard;
