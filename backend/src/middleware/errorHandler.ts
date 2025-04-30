import { Request, Response, NextFunction } from "express";
import { ValidationError, AppError } from "../utils/error";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({ message: err.message });
  } else if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
  } else {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
