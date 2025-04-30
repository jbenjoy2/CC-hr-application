import express from "express";
import employeesRouter from "./routes/employees";
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

app.use("/api", apiRouter);

// Global error handler (always last)
app.use(errorHandler);

export default app;
