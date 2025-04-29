import { Router } from "express";
import * as employeesController from "../controllers/employees-controller";
import { validateRequest } from "../middleware/validateRequest";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "../validation/employeesSchema";

const router = Router();

// Create a new employee
router.post(
  "/",
  validateRequest(createEmployeeSchema),
  employeesController.createEmployee
);

// Get all employees (with net pay)
router.get("/", employeesController.getAll);

// Get an employee by ID
router.get("/:id", employeesController.findById);

// Update an employee (and deductions)
router.patch(
  "/:id",
  validateRequest(updateEmployeeSchema),
  employeesController.updateEmployee
);

// Delete an employee
router.delete("/:id", employeesController.deleteEmployee);

export default router;
