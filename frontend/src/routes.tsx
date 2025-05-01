import { Navigate, Route, Routes } from "react-router-dom";
import EmployeeListPage from "./pages/employee-list";
import { EmployeeDetailsPage } from "./pages/employee-details";
import { EmployeeCreationPage } from "./pages/employee-creation";
import NotFoundPage from "./pages/not-found";

export const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<EmployeeListPage />} />
      <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
      <Route path="/employees/create" element={<EmployeeCreationPage />} />
      <Route path="/employees" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} /> {/* 👈 catch-all */}
    </Routes>
  );
};
