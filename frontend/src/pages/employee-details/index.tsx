import React from "react";
import { useParams } from "react-router-dom";
import { useEmployeeDetails } from "../../hooks/useEmployeeDetails";
import EmployeeForm from "./components/employee-form";
import { DetailsView } from "./components/details-view";

export const EmployeeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = React.useState(false);
  const { employee, loading, refetch } = useEmployeeDetails(id);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!employee) {
    return <div>Error: No employee found</div>;
  }
  return (
    <div className={`container-fluid my-3 px-1 px-xl-4 `}>
      {isEditing ? (
        <div>
          <h2 className="text-primary mb-3 text-center">Edit Employee</h2>
          <EmployeeForm
            mode="edit"
            initialValues={employee}
            onSuccess={() => {
              setIsEditing(false);
              refetch();
            }}
          />
        </div>
      ) : (
        <div>
          <h2 className="text-primary mb-3 text-center">Employee details</h2>
          <DetailsView
            employee={employee}
            onClickEdit={() => setIsEditing(true)}
          />
        </div>
      )}
    </div>
  );
};
