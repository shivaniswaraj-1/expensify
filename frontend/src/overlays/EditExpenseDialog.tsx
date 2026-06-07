import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useOverlayStore, { ExpensePayload } from "@/hooks/useOverlayStore";
import useUpdateExpense from "@/hooks/useUpdateExpense";

const CATEGORIES = [
  "Mobile & Computers","Books & Education","Sports, Outdoor & Travel",
  "Bills & EMI's","Groceries & Pet Supplies","Fashion & Beauty",
  "Gifts & Donations","Investments","Insurance","Entertainment",
  "Home & Utilities","Hobbies & Leisure",
];

type FormValues = { amount: number; category: string; description: string };

const EditExpenseDialog = () => {
  const { isOpen, onClose, type, data } = useOverlayStore();
  const overlayData = data as ExpensePayload;
  const updateExpense = useUpdateExpense();
  const { register, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (overlayData && type === "EDIT_DIALOG") {
      reset({ amount: overlayData.amount, category: overlayData.category, description: overlayData.description });
    }
  }, [overlayData, type, reset]);

  if (!isOpen || type !== "EDIT_DIALOG") return null;

  const onSubmit = (values: FormValues) => {
    if (!overlayData?._id) return;
    updateExpense.mutate(
      { _id: overlayData._id, ...values },
      {
        onSuccess: () => { toast.success("Expense updated!"); onClose(); },
        onError: () => toast.error("Update failed. Please try again."),
      }
    );
  };

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-panel-header">
          <div>
            <div className="modal-panel-title">Edit Expense</div>
            <div style={{ fontSize: ".78rem", color: "var(--text-3)", marginTop: ".1rem" }}>Update the transaction details</div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label">Amount (₹)</label>
              <input className="form-control" type="number" required min="1" {...register("amount")} />
            </div>
            <div className="col-6">
              <label className="form-label">Category</label>
              <select className="form-select" required {...register("category")}>
                <option value="">Select</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label">Description</label>
            <input className="form-control" required {...register("description")} />
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-ghost flex-grow-1" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-lg flex-grow-1"
              disabled={updateExpense.isPending}
              style={{ justifyContent: "center" }}
            >
              {updateExpense.isPending ? (
                <><span className="spinner-border spinner-border-sm" /> Saving...</>
              ) : (
                <><i className="bi bi-check-lg" /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseDialog;
