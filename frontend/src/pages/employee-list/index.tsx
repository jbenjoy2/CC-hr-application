import React, { useState } from "react";
import "./styles.css";
import { useEmployees } from "../../hooks/useEmployees";
import EmployeesTable from "./components/employees-table";
import { useIsMobile } from "../../hooks/useIsMobile";
import { EmployeesCardList } from "./components/employees-card-list";
import { useDebounce } from "../../hooks/useDebounce";
import { EmployeeWithNetPay } from "../../types";
import { useDeleteEmployee } from "../../hooks/useDeleteEmployee";
import DeleteEmployeeModal from "./components/delete-employee-modal";

const baseClass = "employee-list-page";
const EmployeeListPage = () => {
  const isMobile = useIsMobile();
  const [query, setQuery] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeWithNetPay | null>(null);

  function openDeleteModal(emp: EmployeeWithNetPay) {
    setSelectedEmployee(emp);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (selectedEmployee) {
      await deleteEmployee(selectedEmployee.id);
      setShowDeleteModal(false);
      setSelectedEmployee(null);
    }
  }
  const { employees, loading, refetch } = useEmployees();
  const { deleteEmployee } = useDeleteEmployee(refetch);

  const debouncedQuery = useDebounce(query, 300);

  const effectiveQuery = isMobile
    ? searchTriggered
      ? query
      : ""
    : debouncedQuery;
  // Filter employees based on query
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(effectiveQuery.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`${baseClass}`}>
      <h2 className="text-primary mb-3 text-center">All Employees</h2>

      <form
        className="mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (isMobile) setSearchTriggered(true);
        }}
      >
        <input
          type="search"
          className="form-control"
          placeholder="Search by name"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isMobile) setSearchTriggered(true); // always "on" for desktop
            if (isMobile && e.target.value.trim() === "") {
              setSearchTriggered(false); // clear on empty
            }
          }}
        />
      </form>
      {filteredEmployees.length === 0 ? (
        <p className="text-muted">No employees found.</p>
      ) : isMobile ? (
        <div>
          <div className="text-muted text-center small mb-2">
            Tap any card to view details
          </div>
          <EmployeesCardList
            actions={{
              onClickDelete: openDeleteModal,
            }}
            employees={filteredEmployees}
          />
        </div>
      ) : (
        <EmployeesTable
          actions={{ onClickDelete: openDeleteModal }}
          employees={filteredEmployees}
        />
      )}
      <DeleteEmployeeModal
        isOpen={showDeleteModal}
        employeeName={selectedEmployee?.name}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default EmployeeListPage;
