import { Request, Response, NextFunction } from "express";

export type TypedRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;
