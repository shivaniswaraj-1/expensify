import { Link } from "react-router-dom";
import { useTitle } from "react-use";

const FEATURES = [
  {
    icon: "bi-graph-up-arrow",
    title: "Smart Analytics",
    desc: "Visualize spending patterns with interactive charts and trend analysis.",
    color: "#4f46e5",
    bg: "rgba(79,70,229,.15)",
  },
  {
    icon: "bi-bullseye",
    title: "Budget Control",
    desc: "Set monthly budgets, track progress, and get alerts before you overspend.",
    color: "#10b981",
    bg: "rgba(16,185,129,.15)",
  },
  {
    icon: "bi-funnel-fill",
    title: "Smart Filters",
    desc: "Search, filter by category, sort by amount — find any expense instantly.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,.15)",
  },
  {
    icon: "bi-shield-check",
    title: "Secure & Private",
    desc: "JWT-based authentication keeps your financial data safe and private.",
    color: "#06b6d4",
    bg: "rgba(6,182,212,.15)",
  },
];

const STATS = [
  { value: "₹0", label: "Hidden fees" },
  { value: "12+", label: "Categories" },
  { value: "100%", label: "Secure" },
  { value: "∞", label: "Expenses" },
];

const Root = () => {
  useTitle("Expensify — Smart Finance Tracker");

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <i className="bi bi-wallet2" />
          </div>
          <span>Expensify</span>
        </div>
        <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
          <Link
            to="/auth?action=login"
            style={{ color: "rgba(255,255,255,.7)", fontSize: ".85rem", fontWeight: 500, textDecoration: "none", transition: "color .2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.7)")}
          >
            Sign In
          </Link>
          <Link to="/auth?action=signup" className="btn-landing-primary" style={{ padding: ".5rem 1.25rem", fontSize: ".85rem" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="landing-hero">
        <div className="landing-chip">
          <i className="bi bi-stars" />
          Smart expense tracking for everyone
        </div>
        <h1 className="landing-h1">
          Your money,<br />
          <span className="grad">fully understood</span>
        </h1>
        <p className="landing-desc">
          Track expenses, set budgets, and visualize your spending patterns — all in one clean, fast dashboard.
        </p>
        <div className="landing-cta">
          <Link to="/auth?action=signup" className="btn-landing-primary">
            <i className="bi bi-rocket-takeoff" />
            Start for free
          </Link>
          <Link to="/auth?action=login" className="btn-landing-outline">
            <i className="bi bi-box-arrow-in-right" />
            Sign In
          </Link>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "2.5rem", justifyContent: "center", marginTop: "4rem", flexWrap: "wrap" }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
              <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.5)", marginTop: ".2rem", textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="landing-features">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: ".75rem" }}>
            EVERYTHING YOU NEED
          </div>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(1.6rem, 4vw, 2.25rem)", letterSpacing: "-.3px" }}>
            Built for real financial clarity
          </h2>
          <p style={{ color: "rgba(255,255,255,.5)", maxWidth: 420, margin: ".75rem auto 0", fontSize: ".9rem" }}>
            No spreadsheets. No confusion. Just clean insights into where your money goes.
          </p>
        </div>
        <div className="landing-features-grid">
          {FEATURES.map((f) => (
            <div className="landing-feature-card" key={f.title}>
              <div className="feature-icon" style={{ background: f.bg }}>
                <i className={`bi ${f.icon}`} style={{ color: f.color }} />
              </div>
              <h6>{f.title}</h6>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA bottom */}
      <div style={{ textAlign: "center", padding: "4rem 1rem 6rem" }}>
        <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(1.5rem, 4vw, 2rem)", marginBottom: "1.25rem" }}>
          Ready to take control?
        </h2>
        <Link to="/auth?action=signup" className="btn-landing-primary">
          <i className="bi bi-rocket-takeoff" />
          Create free account
        </Link>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <i className="bi bi-wallet2" style={{ color: "rgba(255,255,255,.4)", fontSize: "1rem" }} />
          <span style={{ color: "rgba(255,255,255,.4)", fontSize: ".8rem" }}>Expensify © 2024</span>
        </div>
        <div style={{ color: "rgba(255,255,255,.3)", fontSize: ".75rem" }}>
          Built with React · Bootstrap 5 · MongoDB
        </div>
      </div>
    </div>
  );
};

export default Root;
