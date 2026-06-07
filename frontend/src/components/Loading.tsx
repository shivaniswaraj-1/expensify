export const Loading = () => (
  <div className="spinner-overlay">
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 44, height: 44,
          borderRadius: 12,
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto .75rem",
          boxShadow: "0 4px 16px rgba(79,70,229,.3)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        <i className="bi bi-wallet2" style={{ color: "#fff", fontSize: "1.2rem" }} />
      </div>
      <div style={{ fontSize: ".78rem", color: "var(--text-3)", fontWeight: 500 }}>Loading...</div>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(.92); opacity: .8; }
        }
      `}</style>
    </div>
  </div>
);
