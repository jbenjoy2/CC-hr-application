import { useCallback, useEffect, useState } from "react";
import { getAllEmployees } from "../services/api";
import { EmployeeWithNetPay } from "../types";

export function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeWithNetPay[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllEmployees();
      setEmployees(response);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setEmployees([]); // or show an error state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return { employees, loading, refetch: fetchEmployees };
}
