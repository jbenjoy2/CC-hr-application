import { EmployeeFormValues } from "../../pages/employee-details/components/employee-form";
import api from "../axios";

export async function getAllEmployees() {
  const res = await api.get("/employees");
  return res.data;
}

export async function getEmployeeById(id: string) {
  const res = await api.get(`/employees/${id}`);
  return res.data;
}

export async function createNewEmployee(values: EmployeeFormValues) {
  const res = await api.post("/employees", values);
  return res.data;
}

export async function updateEmployee(
  id: string,
  values: Partial<EmployeeFormValues>
) {
  const res = await api.patch(`/employees/${id}`, values);
  return res.data;
}

export async function deleteEmployee(id: string) {
  await api.delete(`/employees/${id}`);
}
export async function deleteEmployeeDeduction(id: string) {
  await api.delete(`/employee-deductions/${id}`);
}
