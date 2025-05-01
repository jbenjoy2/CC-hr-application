import express from "express";
import employeesRouter from "./routes/employees";
import employeeDeductionsRouter from "./routes/employee-deductions";
import { errorHandler } from "./middleware/errorHandler";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const apiRouter = express.Router();
// Body parser

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // if needed for cookies
  })
);
app.use(express.json());
// Mount employees router
apiRouter.use("/employees", employeesRouter);
apiRouter.use("/employee-deductions", employeeDeductionsRouter);

app.use("/api", apiRouter);

// Global error handler (always last)
app.use(errorHandler);

export default app;
