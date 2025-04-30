import { Route, Routes } from "react-router-dom";
import EmployeeListPage from "./pages/employee-list";

export const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<EmployeeListPage />} />
    </Routes>
  );
};
