import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

type AskResponse = {
  success: boolean;
  answer?: string;
  message?: string;
};

// The AI never runs a database query itself — it only converts the question
// into a small filter object (category/date-range/metric), which the
// backend validates and then runs as a normal MongoDB aggregation scoped to
// the logged-in user. The answer text is built from that real result.
export const AskSpendingCard = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  const ask = useMutation({
    mutationFn: (q: string) => axiosInstance.post("/ai/ask", { question: q }),
    onSuccess: (res) => {
      const { success, answer: a, message } = res.data as AskResponse;
      setAnswer(success && a ? a : message ?? "Couldn't understand that question.");
    },
    onError: () => setAnswer("Something went wrong. Please try again."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || ask.isPending) return;
    setAnswer(null);
    ask.mutate(trimmed);
  };

  return (
    <div className="chart-card h-100">
      <div className="chart-card-header mb-2">
        <div>
          <div className="chart-card-title">Ask Your Spending</div>
          <div className="chart-card-sub">"How much did I spend on groceries last month?"</div>
        </div>
        <div
          style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}
        >
          <i className="bi bi-chat-dots-fill" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Ask a question about your spending..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          autoComplete="off"
        />
        <button
          className="btn btn-primary"
          type="submit"
          disabled={ask.isPending || !question.trim()}
          style={{ whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {ask.isPending ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-send-fill" />}
        </button>
      </form>

      {answer && (
        <div
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: ".85rem 1rem", fontSize: ".85rem", color: "var(--text)" }}
        >
          {answer}
        </div>
      )}
    </div>
  );
};
