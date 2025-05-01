import { useCallback } from "react";
import { deleteEmployeeDeduction as deleteEmployeeDeductionAPI } from "../services/api";
export function useDeleteEmployeeDeduction() {
  const deleteEmployeeDeduction = useCallback(async (id: string) => {
    await deleteEmployeeDeductionAPI(id);
  }, []);

  return { deleteEmployeeDeduction };
}
