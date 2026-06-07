import { Link } from "react-router-dom";
import { useTitle } from "react-use";

const NotFound = () => {
  useTitle("Expensify — Page Not Found");
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "var(--bg)" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "5rem", fontWeight: 800, color: "var(--primary)", lineHeight: 1, marginBottom: "1rem", opacity: .3 }}>404</div>
        <h4 style={{ fontWeight: 800, color: "var(--text)", marginBottom: ".5rem" }}>Page not found</h4>
        <p style={{ color: "var(--text-3)", fontSize: ".9rem", marginBottom: "1.75rem" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn-primary-lg" style={{ display: "inline-flex" }}>
          <i className="bi bi-arrow-left" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
