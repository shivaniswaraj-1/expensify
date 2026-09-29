import { Suspense, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Loading } from "@/components/Loading";
import Sidebar from "@/components/Sidebar";
import NotificationsModal from "@/overlays/NotificationsModal";
import useOverlayStore from "@/hooks/useOverlayStore";
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
  const [searchValue, setSearchValue] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggle } = useDarkMode();
  const { onOpen } = useOverlayStore();

  // Expenses are the only searchable thing in the app right now, so this
  // hands off to the Dashboard's own (already working) search + "no
  // expenses found" empty state rather than duplicating that logic here.
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    navigate(`/dashboard?search=${encodeURIComponent(trimmed)}&page=1`);
  };

  const pageMeta: Record<string, { title: string; sub: string }> = {
    "/dashboard": { title: "Dashboard", sub: "Overview of your finances" },
    "/reports": { title: "Analytics", sub: "Detailed spending insights" },
    "/ai-usage": { title: "AI Usage", sub: "Cost and speed per AI feature" },
  };
  const meta = pageMeta[location.pathname] ?? { title: "SpendWise", sub: "" };

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
            <form className="topbar-search d-none d-md-flex" onSubmit={handleSearchSubmit}>
              <i className="bi bi-search" />
              <input
                placeholder="Search expenses..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </form>

            <button
              className="topbar-btn"
              onClick={toggle}
              title={isDark ? "Light mode" : "Dark mode"}
            >
              <i className={`bi ${isDark ? "bi-sun-fill" : "bi-moon-fill"}`} />
            </button>

            <button
              className="topbar-btn"
              title="Notifications"
              onClick={() => onOpen("NOTIFICATIONS_PANEL")}
            >
              <i className="bi bi-bell-fill" />
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

      <NotificationsModal />
    </>
  );
};
