import { useCallback, useState } from "react";
import { createNewEmployee, updateEmployee } from "../services/api";
import { EmployeeFormValues } from "../pages/employee-details/components/employee-form";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "../types";

export function useSaveEmployee() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError<ApiErrorResponse> | null>(null);
  const navigate = useNavigate();
  const saveEmployee = useCallback(
    async (
      values: EmployeeFormValues,
      mode: "create" | "edit",
      employeeId?: string,
      onSuccess?: () => void
    ) => {
      setLoading(true);
      setError(null);
      try {
        if (mode === "create") {
          const newEmployee = await createNewEmployee(values);
          // Redirect or perform any other action with newEmployee.id
          navigate(`/employees/${newEmployee.id}`);
        } else if (mode === "edit" && employeeId) {
          await updateEmployee(employeeId, values);
          if (onSuccess) {
            onSuccess(); // Call refetch or any other success handler
          }
        }
      } catch (err) {
        setError(err as AxiosError<ApiErrorResponse>);
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );
  const clearError = () => setError(null);

  return { saveEmployee, loading, error, clearError };
}
