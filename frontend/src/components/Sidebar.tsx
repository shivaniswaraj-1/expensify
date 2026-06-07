import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useLogout";

interface SidebarProps {
  show: boolean;
  onClose: () => void;
}

const Sidebar = ({ show, onClose }: SidebarProps) => {
  const user = useAuthStore((s) => s.user);
  const { logout } = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth?action=login");
  };

  const initial = user?.email?.charAt(0)?.toUpperCase() ?? "U";
  const username = user?.email?.split("@")[0] ?? "User";

  return (
    <>
      <div
        className={`sidebar-overlay ${show ? "show" : ""}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${show ? "show" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <i className="bi bi-wallet2" />
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">Expensify</div>
            <div className="sidebar-brand-sub">Finance Tracker</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={onClose}
          >
            <i className="bi bi-grid-1x2-fill" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={onClose}
          >
            <i className="bi bi-bar-chart-line-fill" />
            <span>Analytics</span>
          </NavLink>

          <div className="sidebar-section-label mt-2">Account</div>
          <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>
            <i className="bi bi-bell-fill" />
            <span>Notifications</span>
            <span className="nav-badge">2</span>
          </a>
          <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>
            <i className="bi bi-gear-fill" />
            <span>Settings</span>
          </a>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initial}</div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div className="sidebar-user-name">{username}</div>
              <span className="sidebar-user-email">{user?.email}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
