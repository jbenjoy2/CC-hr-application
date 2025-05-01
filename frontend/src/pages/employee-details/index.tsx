import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEmployeeDetails } from "../../hooks/useEmployeeDetails";
import EmployeeForm from "./components/employee-form";
import { DetailsView } from "./components/details-view";
import CenteredSpinner from "../../components/custom-spinner";

export const EmployeeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = React.useState(false);
  const { employee, loading, refetch } = useEmployeeDetails(id);
  const navigate = useNavigate();

  if (loading) {
    return <CenteredSpinner />;
  }
  if (!employee) {
    return <div>Error: No employee found</div>;
  }
  return (
    <div className={` container-xl-fluid my-3 px-1 px-xl-4 w-100 w-xl-75`}>
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
          <div className="d-flex flex-column align-items-center">
            <button
              className="btn btn-outline-secondary align-self-xl-start order-1 order-xl-0 mb-2 mb-xl-0"
              onClick={() => {
                navigate("/");
              }}
            >
              View All Employees
            </button>
            <h2 className="text-primary mb-2 mb-xl-3 text-center">
              Employee details
            </h2>
          </div>
          <DetailsView
            employee={employee}
            onClickEdit={() => setIsEditing(true)}
          />
        </div>
      )}
    </div>
  );
};
