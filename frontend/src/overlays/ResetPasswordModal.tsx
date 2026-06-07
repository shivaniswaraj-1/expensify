import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";
import useOverlayStore from "@/hooks/useOverlayStore";

const ResetPasswordModal = () => {
  const { isOpen, type, onClose } = useOverlayStore();
  const resetPass = useForm();

  const resetPassword = useMutation({
    mutationFn: (formData: Record<string, unknown>) => axiosInstance.post("/auth/token", formData),
    onSuccess: () => { toast.success("Password reset email sent! Check your inbox."); onClose(); },
    onError: (error: AxiosError) => {
      const msg = error?.response?.status === 404 ? "No account found with that email." : "Something went wrong!";
      toast.error(msg);
      onClose();
    },
    onSettled: () => resetPass.reset(),
  });

  if (!isOpen || type !== "RESET_PASSWORD_MODAL") return null;

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-panel-header">
          <div>
            <div className="modal-panel-title">Reset Password</div>
            <div style={{ fontSize: ".78rem", color: "var(--text-3)", marginTop: ".1rem" }}>
              We'll send you a reset link by email
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={resetPass.handleSubmit((d) => resetPassword.mutate(d))}>
          <div className="mb-4">
            <label className="form-label">Email Address</label>
            <input
              className="form-control"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="off"
              {...resetPass.register("email")}
            />
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-ghost flex-grow-1" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-lg flex-grow-1"
              disabled={resetPassword.isPending}
              style={{ justifyContent: "center" }}
            >
              {resetPassword.isPending ? (
                <><span className="spinner-border spinner-border-sm" /> Sending...</>
              ) : (
                <><i className="bi bi-envelope-fill" /> Send Reset Link</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
