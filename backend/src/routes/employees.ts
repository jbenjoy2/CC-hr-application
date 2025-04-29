import { Router } from "express";
import * as employeesController from "../controllers/employees-controller";

const router = Router();

// Create a new employee
router.post("/", employeesController.createEmployee);

// Get all employees (with net pay)
router.get("/", employeesController.getAll);

// Get an employee by ID
router.get("/:id", employeesController.findById);

// Update an employee (and deductions)
router.patch("/:id", employeesController.updateEmployee);

// Delete an employee
router.delete("/:id", employeesController.deleteEmployee);

export default router;
