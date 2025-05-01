import { useCallback } from "react";
import { deleteEmployee as deleteEmployeeAPI } from "../services/api";

export function useDeleteEmployee(refetch: () => Promise<void>) {
  const deleteEmployee = useCallback(
    async (id: string) => {
      await deleteEmployeeAPI(id);
      await refetch(); // use the refetch from the current hook context
    },
    [refetch]
  );

  return { deleteEmployee };
}
