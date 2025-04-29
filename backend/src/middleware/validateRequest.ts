import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validateRequest(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.flatten();
      res.status(400).json({ errors });
      return;
    }

    next();
  };
}
