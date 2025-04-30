export enum DeductionTypes {
  TAX = "TAX",
  BENEFITS = "BENEFITS",
  UNION = "UNION",
  OTHER = "OTHER",
}

export interface Deduction {
  id: string;
  deductionType: DeductionTypes;
  deductionAmount: number;
}

export interface EmployeeBase {
  id: string;
  name: string;
  salary: number;
}

export interface EmployeeWithDeductions extends EmployeeBase {
  deductions: readonly Deduction[];
}

export interface EmployeeWithNetPay extends EmployeeBase {
  totalDeductions: number;
  netPay: number;
}
