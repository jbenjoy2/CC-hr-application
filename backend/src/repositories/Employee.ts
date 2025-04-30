import { NotFoundError, ValidationError } from "../utils/error";
import db from "../db/db";
import { Knex } from "knex";

export interface DbEmployee {
  readonly id: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly name: string;
  readonly salary: number;
}

export interface DbEmployeeWithNetPay extends DbEmployee {
  total_deductions: number;
  net_pay: number;
}

export const getAllEmployeesWithNetPay = async (): Promise<
  DbEmployeeWithNetPay[]
> => {
  return await db("employees as e")
    .leftJoin("employee_deductions as d", "e.id", "d.employee_id")
    .groupBy("e.id")
    .select(
      "e.id",
      "e.name",
      "e.salary",
      "e.created_at",
      "e.updated_at",
      db.raw("COALESCE(SUM(d.deduction_amount), 0) as total_deductions"),
      db.raw("e.salary - COALESCE(SUM(d.deduction_amount), 0) as net_pay")
    );
};
export const getEmployeeById = async (
  employeeId: string
): Promise<DbEmployee> => {
  const foundEmployee = await db("employees")
    .select("*")
    .where({ id: employeeId })
    .first();
  if (!foundEmployee) {
    throw new NotFoundError(`Employee with id ${employeeId} not found`);
  }
  return foundEmployee;
};

export const createNewEmployee = async (
  employeeData: Pick<DbEmployee, "name" | "salary">,
  trx?: Knex.Transaction
): Promise<DbEmployee> => {
  try {
    const dbInstance = trx ?? db;
    const [newEmployee] = await dbInstance("employees")
      .insert({ ...employeeData })
      .returning("*");

    return newEmployee;
  } catch (error: any) {
    if (error.code === "23505") {
      throw new ValidationError("An employee with that name already exists.");
    }

    throw error;
  }
};

interface EmployeeUpdateFields {
  name?: string;
  salary?: number;
}
// Update User by ID
export const updateEmployeeById = async (
  id: string,
  updates: EmployeeUpdateFields
): Promise<DbEmployee | undefined> => {
  if (!updates.name && updates.salary === undefined) {
    console.warn(
      `No updates provided for employee ${id}. Returning current record.`
    );
    return await getEmployeeById(id);
  }

  const foundEmployee = await db("employees")
    .select(["id"])
    .where({ id })
    .first();

  if (!foundEmployee) {
    throw new NotFoundError(`Employee with id ${id} not found`);
  }
  const updatedFields: Partial<EmployeeUpdateFields> = {};
  if (updates.name) {
    updatedFields.name = updates.name;
  }
  if (updates.salary !== undefined) {
    updatedFields.salary = updates.salary;
  }
  const [updatedEmployee] = await db("employees")
    .where({ id })
    .update({ ...updatedFields })
    .returning("*");
  return updatedEmployee;
};

export const deleteEmployeeById = async (id: string): Promise<boolean> => {
  const deletedRows = await db("employees").where({ id }).del();
  return deletedRows > 0;
};
