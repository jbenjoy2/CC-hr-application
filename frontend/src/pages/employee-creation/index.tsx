import React from "react";
import EmployeeForm from "../employee-details/components/employee-form";
import { EmployeeWithDeductions } from "../../types";
import { Helmet } from "react-helmet";

export const EmployeeCreationPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>CC Manage - New Employee</title>
      </Helmet>
      <div className={`container-xl-fluid my-3 px-1 px-xl-4 w-100 w-xl-75`}>
        <h2 className="text-primary mb-3 text-center">Create Employee</h2>
        <EmployeeForm
          mode="create"
          initialValues={{} as EmployeeWithDeductions}
        />
      </div>
    </>
  );
};
