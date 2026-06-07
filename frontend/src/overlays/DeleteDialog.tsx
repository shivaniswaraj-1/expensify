import { toast } from "react-toastify";
import useOverlayStore from "@/hooks/useOverlayStore";
import useDeleteExpense from "@/hooks/useDeleteExpense";

const DeleteDialog = () => {
  const { isOpen, onClose, type, data } = useOverlayStore();
  const deleteExpense = useDeleteExpense();

  if (!isOpen || type !== "DELETE_DIALOG") return null;

  const handleDelete = () => {
    deleteExpense.mutate(data as string, {
      onSuccess: () => { toast.success("Expense deleted."); onClose(); },
      onError: () => toast.error("Delete failed. Try again."),
    });
  };

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: "center", padding: ".5rem 0 1rem" }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1rem", fontSize: "1.4rem", color: "var(--danger)",
            }}
          >
            <i className="bi bi-trash3-fill" />
          </div>
          <h5 style={{ fontWeight: 800, color: "var(--text)", marginBottom: ".5rem" }}>Delete Expense?</h5>
          <p style={{ color: "var(--text-3)", fontSize: ".85rem", marginBottom: "1.75rem" }}>
            This action cannot be undone. The transaction will be permanently removed from your records.
          </p>
          <div className="d-flex gap-2">
            <button className="btn btn-ghost flex-grow-1" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn flex-grow-1"
              style={{ background: "var(--danger)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, justifyContent: "center" }}
              onClick={handleDelete}
              disabled={deleteExpense.isPending}
            >
              {deleteExpense.isPending ? (
                <><span className="spinner-border spinner-border-sm" /> Deleting...</>
              ) : (
                <><i className="bi bi-trash3-fill" /> Delete</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;
