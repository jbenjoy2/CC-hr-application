import { Router } from "express";
import * as employeeDeductionsController from "../controllers/employee-deductions-controller";

const router = Router();

// Delete an employee deduction
router.delete("/:id", employeeDeductionsController.deleteEmployeeDeduction);

export default router;
