import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { ExpensePayload } from "./useOverlayStore";
import axiosInstance from "@/lib/axios";

const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") ?? "1");
  const rows = JSON.parse(localStorage.getItem("rows") ?? "10");

  return useMutation({
    mutationFn: (payload: ExpensePayload) =>
      axiosInstance.patch(`/expense/${payload._id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-expenses", { currentPage, rows }] });
      queryClient.invalidateQueries({ queryKey: ["all-expenses-stats"] });
    },
  });
};

export default useUpdateExpense;
