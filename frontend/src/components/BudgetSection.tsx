import { useState } from "react";
import { toast } from "react-toastify";

interface BudgetSectionProps {
  totalExpense: number;
}

export const BudgetSection = ({ totalExpense }: BudgetSectionProps) => {
  const [budget, setBudget] = useState(() => Number(localStorage.getItem("monthly_budget") ?? "0"));
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(budget.toString());

  const pct = budget > 0 ? Math.min(100, Math.round((totalExpense / budget) * 100)) : 0;
  const overBudget = budget > 0 && totalExpense > budget;
  const barColor = overBudget ? "#ef4444" : pct > 80 ? "#f59e0b" : "#10b981";

  const save = () => {
    const val = Math.max(0, Number(input) || 0);
    setBudget(val);
    localStorage.setItem("monthly_budget", val.toString());
    setEditing(false);
    if (val > 0 && totalExpense > val) toast.warn("You're over budget this month!", { autoClose: 4000 });
  };

  return (
    <div className="stat-card h-100">
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div style={{ flex: 1 }}>
          <div className="stat-label">Monthly Budget</div>
          {budget > 0 ? (
            <div className="stat-value sm mono">₹{budget.toLocaleString()}</div>
          ) : (
            <div style={{ color: "var(--text-3)", fontSize: ".85rem", marginTop: ".25rem", fontWeight: 500 }}>Not configured</div>
          )}
        </div>
        <div className="stat-icon stat-icon-primary">
          <i className="bi bi-bullseye" />
        </div>
      </div>

      {budget > 0 && (
        <>
          <div className="budget-track mb-2">
            <div className="budget-fill" style={{ width: `${pct}%`, background: barColor }} />
          </div>
          <div className="d-flex justify-content-between" style={{ fontSize: ".72rem", color: "var(--text-3)" }}>
            <span>{pct}% used</span>
            {overBudget
              ? <span style={{ color: "var(--danger)", fontWeight: 700 }}>Over ₹{(totalExpense - budget).toLocaleString()}</span>
              : <span style={{ color: "var(--accent)", fontWeight: 600 }}>₹{(budget - totalExpense).toLocaleString()} left</span>
            }
          </div>
        </>
      )}

      {editing ? (
        <div className="d-flex gap-2 mt-3">
          <input
            className="form-control form-control-sm"
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 30000"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && save()}
          />
          <button className="btn btn-primary btn-sm" onClick={save} style={{ whiteSpace: "nowrap", padding: "0 .75rem" }}>Save</button>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditing(false)}>✕</button>
        </div>
      ) : (
        <button
          className="btn btn-ghost w-100 mt-3"
          style={{ fontSize: ".78rem", justifyContent: "center" }}
          onClick={() => { setInput(budget.toString()); setEditing(true); }}
        >
          <i className="bi bi-pencil me-1" />
          {budget > 0 ? "Edit Budget" : "Set Budget"}
        </button>
      )}
    </div>
  );
};
