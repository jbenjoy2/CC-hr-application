import { DbEmployee, DbEmployeeWithNetPay } from "repositories/Employee";
import { DbEmployeeDeduction } from "repositories/EmployeeDeduction";
import { Deduction, EmployeeBase, EmployeeWithNetPay } from "types";

export function employee_dbToTs(db: DbEmployee): EmployeeBase {
  return {
    id: db.id,
    name: db.name,
    salary: db.salary,
  };
}

export function employeeWithPay_dbToTs(
  db: DbEmployeeWithNetPay
): EmployeeWithNetPay {
  return {
    id: db.id,
    name: db.name,
    salary: db.salary,
    totalDeductions: db.total_deductions,
    netPay: db.net_pay,
  };
}

export function deduction_dbToTs(db: DbEmployeeDeduction): Deduction {
  return {
    id: db.id,
    deductionType: db.deduction_type,
    deductionAmount: db.deduction_amount,
  };
}
