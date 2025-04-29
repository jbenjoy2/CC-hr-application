import { z } from "zod";

// Reuse your deduction types
export const DeductionTypes = ["TAX", "BENEFITS", "UNION", "OTHER"] as const;

// A single deduction
const deductionSchema = z.object({
  deduction_type: z.enum(DeductionTypes),
  deduction_amount: z.number().min(0, "Deduction amount must be >= 0"),
});

// CREATE Employee
export const createEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  salary: z.number().min(0, "Salary must be >= 0"),
  deductions: z.array(deductionSchema).optional(), // Optional at create
});

// UPDATE Employee
export const updateEmployeeSchema = z.object({
  name: z.string().optional(),
  salary: z.number().min(0, "Salary must be >= 0").optional(),
  deductions: z.array(deductionSchema).optional(),
});
