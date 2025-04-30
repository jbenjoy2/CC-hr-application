import { NextFunction, Request, Response } from "express";
import {
  createNewEmployee,
  deleteEmployeeById,
  getAllEmployeesWithNetPay,
  getEmployeeById,
  updateEmployeeById,
} from "../repositories/Employee";
import {
  createOrUpdateEmployeeDeductions,
  DbEmployeeDeduction,
  getAllDeductionsByEmployeeId,
} from "../repositories/EmployeeDeduction";
import { EmployeeWithDeductions } from "../types";
import {
  deduction_dbToTs,
  employee_dbToTs,
  employeeWithPay_dbToTs,
} from "./transforms";
import { NotFoundError, ValidationError } from "../utils/error";
import db from "../db/db";
import { normalizeDeductionsBasedOnSalary } from "../utils";

export const createEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, salary, deductions } = req.body;

  try {
    const newEmployeeFull = await db.transaction(async (trx) => {
      const normalizedDeductions = normalizeDeductionsBasedOnSalary(
        salary,
        deductions
      );
      const employee = await createNewEmployee({ name, salary }, trx);
      const insertedDeductions = await createOrUpdateEmployeeDeductions(
        employee.id,
        normalizedDeductions,
        trx
      );

      return {
        ...employee_dbToTs(employee),
        deductions: insertedDeductions.map(deduction_dbToTs),
      };
    });

    // ✅ Now we know `newEmployeeFull` is definitely assigned
    res.status(201).json(newEmployeeFull);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("hit this route");
  try {
    const employees = await getAllEmployeesWithNetPay();
    console.log({ employees });
    res.json(employees.map(employeeWithPay_dbToTs));
  } catch (error) {
    console.log("in ehre");
    next(error);
  }
};

export const findById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const employee = await getEmployeeById(req.params.id);
    const deductions = await getAllDeductionsByEmployeeId(employee.id);

    const result: EmployeeWithDeductions = {
      ...employee_dbToTs(employee),
      deductions: deductions.map(deduction_dbToTs),
    };

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, salary, deductions } = req.body;

    const employee = await updateEmployeeById(req.params.id, { name, salary });

    if (!employee) {
      throw new ValidationError(`Invalid employee id: ${req.params.id}`);
    }

    const existingEmployeeDeductions = (
      await getAllDeductionsByEmployeeId(employee.id)
    ).map(deduction_dbToTs);

    const mergedMap = new Map(
      existingEmployeeDeductions.map((d) => [d.deductionType, d])
    );

    // Override or insert with request-provided values
    for (const newDeduction of deductions ?? []) {
      mergedMap.set(newDeduction.deductionType, {
        ...mergedMap.get(newDeduction.deductionType),
        ...newDeduction, // new amount/type will override
      });
    }

    const mergedDeductions = Array.from(mergedMap.values());

    const normalizedDeductions = normalizeDeductionsBasedOnSalary(
      employee.salary,
      mergedDeductions
    );

    await createOrUpdateEmployeeDeductions(employee.id, normalizedDeductions);

    const allDeductions = await getAllDeductionsByEmployeeId(employee.id);

    const result: EmployeeWithDeductions = {
      ...employee_dbToTs(employee),
      deductions: allDeductions.map(deduction_dbToTs),
    };

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
export const deleteEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await deleteEmployeeById(req.params.id);
    if (!deleted) {
      throw new NotFoundError(`Employee with id ${req.params.id} not found`);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
