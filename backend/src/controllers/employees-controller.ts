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
import { ValidationError } from "../utils/error";
import db from "../db/db";

export const createEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, salary, deductions } = req.body;

  try {
    const newEmployeeFull = await db.transaction(async (trx) => {
      const employee = await createNewEmployee({ name, salary }, trx);
      const insertedDeductions = await createOrUpdateEmployeeDeductions(
        employee.id,
        deductions,
        trx
      );

      return {
        ...employee_dbToTs(employee),
        deductions: insertedDeductions.map(deduction_dbToTs),
      };
    });

    // ✅ Now we know `newEmployeeFull` is definitely assigned
    res.status(201).json({ newEmployee: newEmployeeFull });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const employees = await getAllEmployeesWithNetPay();
    res.json(employees.map(employeeWithPay_dbToTs));
  } catch (error) {
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
    if (Array.isArray(deductions) && deductions.length > 0) {
      await createOrUpdateEmployeeDeductions(employee.id, deductions);
    }

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
      res.status(404).json({ error: "Employee not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
