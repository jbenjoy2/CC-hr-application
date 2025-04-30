import { useCallback } from "react";
import axios from "../services/axios";

export function useDeleteEmployee(refetch: () => Promise<void>) {
  const deleteEmployee = useCallback(
    async (id: string) => {
      await axios.delete(`/employees/${id}`);
      await refetch(); // use the refetch from the current hook context
    },
    [refetch]
  );

  return { deleteEmployee };
}
