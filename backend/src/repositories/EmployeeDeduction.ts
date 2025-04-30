import { Deduction, DeductionTypes } from "../types";
import db from "../db/db";
import { ValidationError } from "../utils/error";
import { Knex } from "knex";

export interface DbEmployeeDeduction {
  readonly id: string;
  readonly employee_id: string;
  readonly deduction_type: DeductionTypes;
  readonly deduction_amount: number;
  readonly created_at: Date;
  readonly updated_at: Date;
}

export const getAllDeductionsByEmployeeId = async (
  employeeId: string
): Promise<readonly DbEmployeeDeduction[]> => {
  return await db("employee_deductions")
    .select("*")
    .where({ employee_id: employeeId });
};

export const createOrUpdateEmployeeDeductions = async (
  employeeId: string,
  deductions: Pick<Deduction, "deductionAmount" | "deductionType">[],
  trx?: Knex.Transaction
): Promise<readonly DbEmployeeDeduction[]> => {
  const dbInstance = trx ?? db;
  if (!deductions.length) return [];
  const foundEmployee = await dbInstance("employees")
    .select(["id"])
    .where({ id: employeeId })
    .first();

  if (!foundEmployee) {
    throw new ValidationError(`Employee with id: ${employeeId} not found`);
  }

  const rows = deductions.map((d) => ({
    employee_id: employeeId,
    deduction_type: d.deductionType,
    deduction_amount: d.deductionAmount,
  }));

  return await dbInstance("employee_deductions")
    .insert(rows)
    .onConflict(["employee_id", "deduction_type"])
    .merge()
    .returning("*");
};

// uncomment below to add in logic to update individual deductions in line on the front end

// export const updateDeductionAmount = async (
//   deductionId: string,
//   amount: number
// ): Promise<DbEmployeeDeduction> => {
//   const [updatedDeduction] = await db("employee_deductions")
//     .where({ id: deductionId })
//     .update({ deduction_amount: amount })
//     .returning("*");

//   return updatedDeduction;
// };
