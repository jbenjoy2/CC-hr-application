import { useCallback, useEffect, useState } from "react";
import { getAllEmployees } from "../services/api";
import { EmployeeWithNetPay } from "../types";

export function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeWithNetPay[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const response = await getAllEmployees();
    setEmployees(response);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return { employees, loading, refetch: fetchEmployees };
}
