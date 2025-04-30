import { EmployeeWithNetPay } from "../../../types";
import { useNavigate } from "react-router-dom";
interface Props {
  readonly employee: EmployeeWithNetPay;
  onDelete: (id: string) => void;
}

export const EmployeeListCard: React.FC<Props> = (p) => {
  const navigate = useNavigate();
  return (
    <div
      className="card shadow-sm p-3"
      onClick={() => navigate(`/employees/${p.employee.id}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="position-absolute top-0 end-0 p-2 d-flex gap-2">
        <button
          className="btn btn-outline-danger btn-sm position-absolute top-0 end-0 m-2"
          onClick={(e) => {
            e.stopPropagation();
            p.onDelete(p.employee.id);
          }}
          title="Delete"
        >
          <span className="material-icons" style={{ fontSize: "20px" }}>
            delete
          </span>
        </button>
      </div>
      <h5 className="card-title mb-1">{p.employee.name}</h5>
      <div className="card-text small">
        <div>
          Salary: <strong>${p.employee.salary}</strong>
        </div>
        <div>
          Deductions: <strong>${p.employee.totalDeductions}</strong>
        </div>
        <div>
          Net Pay: <strong>${p.employee.netPay}</strong>
        </div>
      </div>
    </div>
  );
};
