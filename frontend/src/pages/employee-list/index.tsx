import React from "react";
import "./styles.css";
import { useEmployees } from "../../hooks/useEmployee";
import EmployeesTable from "./components/employees-table";
import { useIsMobile } from "../../hooks/useIsMobile";
import { EmployeesCardList } from "./components/employees-card-list";

const baseClass = "employee-list-page";
const EmployeeListPage = () => {
  const isMobile = useIsMobile();
  const { employees, loading } = useEmployees();
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`${baseClass} container-fluid my-3 px-1 px-xl-4 `}>
      <h2 className="text-primary mb-3 text-center">All Employees</h2>
      {isMobile ? (
        <EmployeesCardList employees={employees} />
      ) : (
        <EmployeesTable employees={employees} />
      )}
    </div>
  );
};

export default EmployeeListPage;
