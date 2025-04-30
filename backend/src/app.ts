import express from "express";
import employeesRouter from "./routes/employees";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const apiRouter = express.Router();
// Body parser
app.use(express.json());
// Mount employees router
apiRouter.use("/employees", employeesRouter);

app.use("/api", apiRouter);

// Global error handler (always last)
app.use(errorHandler);

export default app;
