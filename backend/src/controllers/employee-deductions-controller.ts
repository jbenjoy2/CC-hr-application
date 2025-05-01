import { NextFunction, Request, Response } from "express";
import { deleteDeductionById } from "../repositories/EmployeeDeduction";
import { NotFoundError } from "../utils/error";
export const deleteEmployeeDeduction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await deleteDeductionById(req.params.id);
    if (!deleted) {
      throw new NotFoundError(
        `Employee Deduciton with id ${req.params.id} not found`
      );
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
