import { EmployeeWithNetPay } from "../../../types";
import { EmployeeListCard } from "./employees-list-card";

interface Props {
  readonly employees: readonly EmployeeWithNetPay[];
  readonly actions: {
    onClickDelete: (emp: EmployeeWithNetPay) => void;
  };
}
export const EmployeesCardList: React.FC<Props> = (p) => {
  return (
    <div className="d-flex flex-column gap-3">
      {p.employees.map((emp) => (
        <EmployeeListCard
          key={emp.id}
          employee={emp}
          onDelete={() => p.actions.onClickDelete(emp)}
        />
      ))}
    </div>
  );
};
