import { EmployeeWithDeductions, Deduction } from "types";
import { DbEmployeeDeduction } from "../repositories/EmployeeDeduction";

// src/utils/validateEnumValue.ts
export function isValidEnumValue<T extends object>(
  enumObj: T,
  value: any
): value is T[keyof T] {
  return Object.values(enumObj).includes(value);
}

type DeductionInput = Pick<Deduction, "deductionType" | "deductionAmount">;

export function normalizeDeductionsBasedOnSalary(
  salary: number,
  deductions?: DeductionInput[]
): DeductionInput[] {
  if (!deductions?.length) return [];

  // Case 1: salary is 0 → zero out all deductions
  if (salary === 0) {
    return deductions.map((d) => ({ ...d, deductionAmount: 0 }));
  }

  // Case 2: cap deductions so total <= salary
  const total = deductions.reduce((sum, d) => sum + d.deductionAmount, 0);
  if (total <= salary) return deductions;

  // Proportional scaling (or just cap each until budget used up)
  const scale = salary / total;
  return deductions.map((d) => ({
    ...d,
    deductionAmount: Math.floor(d.deductionAmount * scale),
  }));
}
