import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTitle } from "react-use";
import { FieldValues, useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import { useLogin } from "@/hooks/useLogin";
import { useSignup } from "@/hooks/useSignup";
import useOverlayStore from "@/hooks/useOverlayStore";
import ResetPasswordModal from "@/overlays/ResetPasswordModal";

const FEATURES = [
  { icon: "bi-graph-up-arrow", text: "Visual spending analytics & trends" },
  { icon: "bi-bullseye", text: "Monthly budget tracking & alerts" },
  { icon: "bi-shield-lock-fill", text: "JWT-secured private finance data" },
  { icon: "bi-download", text: "Export CSV & PDF reports" },
];

const Auth = () => {
  useTitle("Expensify — Sign In");
  const [searchParams, setSearchParams] = useSearchParams();
  const isLogin = searchParams.get("action") !== "signup";
  const [showPass, setShowPass] = useState(false);

  const login = useLogin();
  const signup = useSignup();
  const { onOpen } = useOverlayStore();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const switchMode = () => setSearchParams({ action: isLogin ? "signup" : "login" });
  const onSubmit = (data: FieldValues) => {
    if (isLogin) login.mutate(data);
    else signup.mutate(data);
  };

  const mutation = isLogin ? login : signup;
  const errorMsg =
    isAxiosError(mutation.error) && mutation.error.response?.data?.message
      ? mutation.error.response.data.message
      : mutation.isError
      ? "Something went wrong. Please try again."
      : null;

  return (
    <div className="auth-page">
      {/* Left hero panel */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: "2rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="bi bi-wallet2" style={{ color: "#fff", fontSize: "1.1rem" }} />
            </div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: "1rem" }}>Expensify</span>
          </div>
          <h2 className="auth-hero-h">
            Take control of your <span style={{ background: "linear-gradient(90deg,#a5b4fc,#5eead4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>finances</span>
          </h2>
          <p>The smart expense tracker built for individuals who want clarity, not complexity.</p>
          <div className="auth-hero-features">
            {FEATURES.map((f) => (
              <div className="auth-hero-feature" key={f.text}>
                <i className={`bi ${f.icon}`} />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* decorative circles */}
        <div style={{ position: "absolute", bottom: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(99,102,241,.15)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -60, right: 60, width: 180, height: 180, borderRadius: "50%", background: "rgba(16,185,129,.1)", pointerEvents: "none" }} />
      </div>

      {/* Right form panel */}
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <i className="bi bi-wallet2" />
            </div>
            <span className="auth-logo-name">Expensify</span>
          </div>

          <div className="auth-card">
            <h4>{isLogin ? "Welcome back" : "Create account"}</h4>
            <p className="subtitle">
              {isLogin
                ? "Sign in to your dashboard to continue"
                : "Start tracking your expenses today — it's free"}
            </p>

            {/* Tab switcher */}
            <div className="pill-tabs w-100 mb-4" style={{ display: "flex" }}>
              {(["login", "signup"] as const).map((mode) => (
                <button
                  key={mode}
                  className={`pill-tab flex-grow-1 ${isLogin === (mode === "login") ? "active" : ""}`}
                  onClick={() => setSearchParams({ action: mode })}
                >
                  {mode === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {errorMsg && (
              <div
                className="d-flex align-items-center gap-2 mb-3 p-3"
                style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, color: "var(--danger)", fontSize: ".82rem" }}
              >
                <i className="bi bi-exclamation-circle-fill" style={{ flexShrink: 0 }} />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {!isLogin && (
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="John Doe"
                    required
                    autoComplete="off"
                    {...register("name")}
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  className="form-control"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="off"
                  {...register("email")}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <input
                    className="form-control"
                    type={showPass ? "text" : "password"}
                    placeholder="Enter password"
                    required
                    autoComplete="off"
                    style={{ borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)", borderRight: "none" }}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ borderRadius: "0 var(--radius-sm) var(--radius-sm) 0", padding: "0 .9rem" }}
                    onClick={() => setShowPass((p) => !p)}
                  >
                    <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="text-end mb-3">
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0"
                    style={{ fontSize: ".8rem", color: "var(--primary)", textDecoration: "none" }}
                    onClick={() => onOpen("RESET_PASSWORD_MODAL")}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary-lg w-100"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    Please wait...
                  </>
                ) : isLogin ? (
                  <>
                    <i className="bi bi-box-arrow-in-right" />
                    Sign In
                  </>
                ) : (
                  <>
                    <i className="bi bi-rocket-takeoff" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-3" style={{ fontSize: ".8rem", color: "var(--text-3)" }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                className="btn btn-link btn-sm p-0"
                style={{ fontSize: ".8rem", color: "var(--primary)", textDecoration: "none" }}
                onClick={switchMode}
              >
                {isLogin ? "Sign up free" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ResetPasswordModal />

      <style>{`
        .auth-hero-h { font-size: 2.2rem; font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 1rem; letter-spacing: -.3px; }
        .auth-hero p { opacity: .7; font-size: .92rem; line-height: 1.65; margin-bottom: 1.75rem; color: #fff; }
      `}</style>
    </div>
  );
};

export default Auth;
