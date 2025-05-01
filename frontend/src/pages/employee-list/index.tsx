import { useState } from "react";
import "./styles.css";
import { useEmployees } from "../../hooks/useEmployees";
import EmployeesTable from "./components/employees-table";
import { useIsMobile } from "../../hooks/useIsMobile";
import { EmployeesCardList } from "./components/employees-card-list";
import { useDebounce } from "../../hooks/useDebounce";
import { EmployeeWithNetPay } from "../../types";
import { useDeleteEmployee } from "../../hooks/useDeleteEmployee";
import DeleteEmployeeModal from "./components/delete-employee-modal";
import { useNavigate } from "react-router-dom";
import CenteredSpinner from "../../components/custom-spinner";

const EmployeeListPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
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
      ? committedQuery
      : ""
    : debouncedQuery;
  // Filter employees based on query
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(effectiveQuery.toLowerCase())
  );

  if (loading) {
    return <CenteredSpinner />;
  }

  return (
    <div className={`container-fluid my-3 px-1 px-xl-4 w-75`}>
      <div className="d-none d-md-flex align-items-center mb-3">
        {/* Left spacer */}
        <div className="flex-grow-1"></div>

        {/* Heading in the center */}
        <div className="text-center">
          <h1 className="text-primary mb-0">All Employees</h1>
        </div>

        {/* Right-aligned button */}
        <div className="flex-grow-1 text-end">
          <button
            className="btn btn-primary"
            onClick={() => {
              navigate("/employees/create");
            }}
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Mobile-only heading */}
      <div className="d-md-none text-center mb-3">
        <h1 className="text-primary mb-0">All Employees</h1>
      </div>
      <form
        className="mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (isMobile) setSearchTriggered(true);
          setCommittedQuery(query);
        }}
      >
        <div className="input-group">
          <input
            type="search"
            className="form-control"
            placeholder="Search by name"
            value={query}
            onChange={(e) => {
              const newQuery = e.target.value;
              setQuery(newQuery);

              if (!isMobile) {
                setSearchTriggered(true);
                setCommittedQuery(newQuery);
              }

              if (isMobile && newQuery.trim() === "") {
                setSearchTriggered(false);
                setCommittedQuery("");
              }
            }}
          />
          {isMobile && (
            <button
              type="submit"
              className="btn btn-outline-primary btn-sm"
              disabled={!query.length}
            >
              <span className="material-icons" style={{ fontSize: "18px" }}>
                search
              </span>
            </button>
          )}
        </div>
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
      <div className="d-md-none mt-3 text-center">
        <button
          className="btn btn-primary w-100"
          onClick={() => {
            navigate("/employees/create");
          }}
        >
          Add Employee
        </button>
      </div>
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
