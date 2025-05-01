import knex from "knex";
import config from "../../db/knexfile"; // Your knexfile
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import { DeductionTypes } from "../../types";
import { DbEmployee } from "repositories/Employee";
import { DbEmployeeDeduction } from "repositories/EmployeeDeduction";
// Ensure we load .env.test or .env
dotenv.config({
  path: `${__dirname}/../../../.env.${process.env.NODE_ENV || "test"}`,
});

const db = knex(config);

// Auto rollback and migrate fresh schema
export async function setupTestDb() {
  console.log("🔄 Resetting test database...");

  await db.migrate.rollback(undefined, true); // rollback everything
  await db.migrate.latest(); // re-run migrations
}

// Truncate all tables between tests
export async function cleanTestDb() {
  const tables = await db.raw(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname='public';
  `);

  const tableNames = tables.rows
    .map((row: { tablename: string }) => row.tablename)
    .filter(
      (name: string) =>
        name !== "knex_migrations" && name !== "knex_migrations_lock"
    );

  if (tableNames.length) {
    const truncateQuery = `TRUNCATE TABLE ${tableNames
      .map((name: string) => `"${name}"`)
      .join(", ")} RESTART IDENTITY CASCADE;`;
    await db.raw(truncateQuery);
  }
}

// Kill db connection after tests
export async function closeTestDb() {
  console.log("🔌 Closing test database connection...");
  await db.destroy();
}

export default db;

export function createMockRes<T = any>(): Response & {
  statusCode: number;
  body: T;
} {
  const res = {
    statusCode: 0 as number, // ✅ force a number type
    body: {} as T, // ✅ force a T type
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: T) {
      if (!this.statusCode) {
        console.log("no code", this.statusCode);
        this.statusCode = 200; // 👈 default if not set
      }
      res.body = payload;
      return res;
    },

    send() {
      return this;
    },
  };

  return res as unknown as Response & {
    statusCode: number;
    body: T;
  };
}

export function createMockReq<
  TBody = any,
  TParams = Record<string, string>
>(options: { body?: TBody; params?: TParams }): Request<any, any, TBody> {
  return {
    body: options.body,
    params: options.params || {},
  } as unknown as Request<any, any, TBody>;
}

export function createMockNext(options?: { shouldThrow?: boolean }): {
  next: NextFunction;
  error: () => any | undefined;
} {
  let capturedError: any;

  const next: NextFunction = (err?: any) => {
    if (err) {
      capturedError = err;
      if (options?.shouldThrow) {
        throw err; // only throw if explicitly requested
      }
    }
  };

  return {
    next,
    error: () => capturedError,
  };
}

export async function seedEmployee({
  name = "Seed User",
  salary = 50000,
}: {
  name?: string;
  salary?: number;
} = {}) {
  const [employee] = await db("employees")
    .insert({ name, salary })
    .returning("*");
  return employee as DbEmployee;
}

export async function seedEmployeeWithDeductions({
  name = "Deducted User",
  salary = 50000,
  deductions = [
    {
      deduction_type: DeductionTypes.TAX,
      deduction_amount: 100,
    },
  ],
}: {
  name?: string;
  salary?: number;
  deductions?: {
    deduction_type: DeductionTypes;
    deduction_amount: number;
  }[];
} = {}) {
  const employee = await seedEmployee({ name, salary });

  const deductionRows = deductions.map((d) => ({
    ...d,
    employee_id: employee.id,
  }));

  const inserted: readonly DbEmployeeDeduction[] = await db(
    "employee_deductions"
  )
    .insert(deductionRows)
    .returning("*");

  return { employee, deductions: inserted };
}
