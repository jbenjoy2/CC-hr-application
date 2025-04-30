import { EmployeeWithNetPay } from "../../../types";
import { EmployeeListCard } from "./employees-list-card";

interface Props {
  readonly employees: readonly EmployeeWithNetPay[];
}
export const EmployeesCardList: React.FC<Props> = (p) => {
  const handleDelete = (id: string) => {
    console.log(`Deleted: ${id}`);
  };
  return (
    <div className="d-flex flex-column gap-3">
      {p.employees.map((emp) => (
        <EmployeeListCard key={emp.id} employee={emp} onDelete={handleDelete} />
      ))}
    </div>
  );
};
