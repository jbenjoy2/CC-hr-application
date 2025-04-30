import { useEffect, useState } from "react";
import { getAllEmployees } from "../services/api";

export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await getAllEmployees();
        console.log({ data });
        setEmployees(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  return { employees, loading, error };
}
