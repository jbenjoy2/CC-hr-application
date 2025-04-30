import React from "react";
import { EmployeeWithDeductions } from "../../../types";

interface Props {
  readonly employee: EmployeeWithDeductions;
  readonly onClickEdit: () => void;
}

export const DetailsView: React.FC<Props> = (p) => {
  const deductionsTotal = p.employee.deductions.reduce(
    (acc, curr) => acc + curr.deductionAmount,
    0
  );
  const netPay = p.employee.salary - deductionsTotal;
  return (
    <div className="">
      <div className="card shadow-sm p-3">
        <h3 className="card-title mb-2">Name: {p.employee.name}</h3>
        <div className="card-text">
          <div>
            <strong className="text-decoration-underline">Salary:</strong> $
            {p.employee.salary}
          </div>
          <div className="fw-bold text-decoration-underline">Deductions</div>
          {p.employee.deductions.length ? (
            <div className="d-flex flex-column ps-5 mb-3">
              {p.employee.deductions.map((d) => (
                <div key={d.id}>
                  <div>Type: {d.deductionType}</div>
                  <div>Amount: ${d.deductionAmount}</div>
                  <hr className="w-25 my-1" />
                </div>
              ))}
              <div>
                Total: <strong>${deductionsTotal}</strong>
              </div>
            </div>
          ) : (
            <div>None</div>
          )}
          <div>
            <strong>Net Pay:</strong> ${netPay}
          </div>
          <button
            className="btn btn-outline-secondary mt-2"
            onClick={p.onClickEdit}
          >
            Edit Employee Details
          </button>
        </div>
      </div>
    </div>
  );
};
