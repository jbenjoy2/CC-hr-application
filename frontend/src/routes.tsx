import { Route, Routes } from "react-router-dom";
import EmployeeListPage from "./pages/employee-list";
import { EmployeeDetailsPage } from "./pages/employee-details";

export const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<EmployeeListPage />} />
      <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
    </Routes>
  );
};
