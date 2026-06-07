import { Suspense, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loading } from "@/components/Loading";
import Sidebar from "@/components/Sidebar";
import { User } from "@/types/auth";

// Dark mode hook
import { useDarkMode } from "@/hooks/useDarkMode";

export const PrivateRoute = ({
  user,
  isInitializing,
}: {
  user: User | null;
  isInitializing: boolean;
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggle } = useDarkMode();

  const pageMeta: Record<string, { title: string; sub: string }> = {
    "/dashboard": { title: "Dashboard", sub: "Overview of your finances" },
    "/reports": { title: "Analytics", sub: "Detailed spending insights" },
  };
  const meta = pageMeta[location.pathname] ?? { title: "Expensify", sub: "" };

  if (isInitializing) return <Loading />;
  if (!user) return <Navigate to="/auth?action=login" replace />;

  return (
    <>
      <Sidebar show={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="topbar-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <i className="bi bi-list" />
            </button>
            <div>
              <div className="topbar-title">{meta.title}</div>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-search d-none d-md-flex">
              <i className="bi bi-search" />
              <input placeholder="Search anything..." />
            </div>

            <button
              className="topbar-btn"
              onClick={toggle}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              <i className={`bi ${isDark ? "bi-sun-fill" : "bi-moon-fill"}`} />
            </button>

            <button className="topbar-btn" title="Notifications">
              <i className="bi bi-bell-fill" />
              <span className="dot" />
            </button>

            <div
              className="topbar-user-chip"
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: ".35rem .75rem",
                cursor: "default",
              }}
            >
              <div
                style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary), var(--accent))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: ".75rem", fontWeight: 700, flexShrink: 0,
                }}
              >
                {user.email?.charAt(0)?.toUpperCase()}
              </div>
              <span style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--text)", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email?.split("@")[0]}
              </span>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </>
  );
};
