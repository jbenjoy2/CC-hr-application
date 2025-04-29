import express from "express";
import employeesRouter from "./routes/employees";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Body parser
app.use(express.json());

// Mount employees router
app.use("/employees", employeesRouter);

// Global error handler (always last)
app.use(errorHandler);

export default app;
