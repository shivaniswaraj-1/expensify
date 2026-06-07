import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import { useTitle } from "react-use";
import axiosInstance from "@/lib/axios";
import { Loading } from "@/components/Loading";

const ResetPassword = () => {
  useTitle("Expensify — Reset Password");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const { register, handleSubmit, getValues } = useForm();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const { isPending, isError, error } = useQuery({
    queryKey: ["validate-token"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/auth/reset-password", { params: { token } });
      return data;
    },
    retry: false,
  });

  const resetPassword = useMutation({
    mutationFn: (formData: Record<string, unknown>) =>
      axiosInstance.post("/auth/reset-password", { ...formData, token }),
    onSuccess: () => {
      toast.success("Password reset successfully!");
      navigate("/auth?action=login");
    },
    onError: () => toast.error("Reset failed. Please try again."),
  });

  if (!token) return <Navigate to="/auth?action=login" replace />;
  if (isPending) return <Loading />;

  if (isError) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "var(--bg)" }}>
      <div className="auth-card" style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.4rem", color: "var(--danger)" }}>
          <i className="bi bi-exclamation-triangle-fill" />
        </div>
        <h5 style={{ fontWeight: 800, color: "var(--text)", marginBottom: ".5rem" }}>Invalid or Expired Link</h5>
        <p style={{ color: "var(--text-3)", fontSize: ".85rem", marginBottom: "1.5rem" }}>
          {isAxiosError(error) ? error.response?.data?.message : "This reset link is no longer valid."}
        </p>
        <a href="/auth?action=login" className="btn-primary-lg" style={{ display: "inline-flex" }}>
          <i className="bi bi-arrow-left" /> Back to Login
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div className="auth-logo" style={{ marginBottom: "1.5rem" }}>
          <div className="auth-logo-icon"><i className="bi bi-wallet2" /></div>
          <span className="auth-logo-name">Expensify</span>
        </div>

        <div className="auth-card">
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto .85rem", boxShadow: "0 4px 12px rgba(16,185,129,.3)" }}>
              <i className="bi bi-shield-lock-fill" style={{ color: "#fff", fontSize: "1.3rem" }} />
            </div>
            <h4 style={{ fontWeight: 800, color: "var(--text)", marginBottom: ".3rem" }}>Set New Password</h4>
            <p style={{ color: "var(--text-3)", fontSize: ".83rem", margin: 0 }}>Choose a strong password for your account</p>
          </div>

          <form onSubmit={handleSubmit((d) => resetPassword.mutate(d))}>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <div className="input-group">
                <input
                  className="form-control"
                  type={showPass1 ? "text" : "password"}
                  placeholder="At least 6 characters"
                  required
                  style={{ borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)", borderRight: "none" }}
                  {...register("password", { minLength: 6 })}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ borderRadius: "0 var(--radius-sm) var(--radius-sm) 0", padding: "0 .9rem" }}
                  onClick={() => setShowPass1((p) => !p)}
                >
                  <i className={`bi ${showPass1 ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Confirm Password</label>
              <div className="input-group">
                <input
                  className="form-control"
                  type={showPass2 ? "text" : "password"}
                  placeholder="Repeat password"
                  required
                  style={{ borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)", borderRight: "none" }}
                  {...register("confirmPassword", {
                    validate: (v) => v === getValues("password") || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ borderRadius: "0 var(--radius-sm) var(--radius-sm) 0", padding: "0 .9rem" }}
                  onClick={() => setShowPass2((p) => !p)}
                >
                  <i className={`bi ${showPass2 ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary-lg w-100"
              disabled={resetPassword.isPending}
              style={{ justifyContent: "center", background: "linear-gradient(135deg,#10b981,#059669)" }}
            >
              {resetPassword.isPending ? (
                <><span className="spinner-border spinner-border-sm" /> Resetting...</>
              ) : (
                <><i className="bi bi-check-circle-fill" /> Reset Password</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
