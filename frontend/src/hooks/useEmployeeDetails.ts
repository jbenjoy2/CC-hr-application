import { useCallback, useEffect, useState } from "react";
import { getEmployeeById } from "../services/api";
import { EmployeeWithDeductions } from "../types";

export function useEmployeeDetails(employeeId?: string) {
  const [employee, setEmployee] = useState<EmployeeWithDeductions | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEmployee = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await getEmployeeById(id);
      setEmployee(response);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (employeeId) {
      fetchEmployee(employeeId);
    } else {
      setEmployee(null);
      setLoading(false);
    }
  }, [employeeId, fetchEmployee]);

  return {
    employee,
    loading,
    refetch: () => employeeId && fetchEmployee(employeeId),
  };
}
