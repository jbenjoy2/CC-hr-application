import { DbEmployeeDeduction } from "../repositories/EmployeeDeduction";

// src/utils/validateEnumValue.ts
export function isValidEnumValue<T extends object>(
  enumObj: T,
  value: any
): value is T[keyof T] {
  return Object.values(enumObj).includes(value);
}

type DeductionInput = Pick<
  DbEmployeeDeduction,
  "deduction_type" | "deduction_amount"
>;

export function normalizeDeductionsBasedOnSalary(
  salary: number,
  deductions?: DeductionInput[]
): DeductionInput[] {
  if (!deductions?.length) return [];

  // Case 1: salary is 0 → zero out all deductions
  if (salary === 0) {
    return deductions.map((d) => ({ ...d, deduction_amount: 0 }));
  }

  // Case 2: cap deductions so total <= salary
  const total = deductions.reduce((sum, d) => sum + d.deduction_amount, 0);
  if (total <= salary) return deductions;

  // Proportional scaling (or just cap each until budget used up)
  const scale = salary / total;
  return deductions.map((d) => ({
    ...d,
    deduction_amount: Math.floor(d.deduction_amount * scale),
  }));
}
