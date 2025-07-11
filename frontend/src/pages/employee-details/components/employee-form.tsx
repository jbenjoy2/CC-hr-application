import React from "react";
import { Formik, Form, Field, FieldArray, FieldProps } from "formik";
import * as Yup from "yup";
import {
  Deduction,
  DeductionTypes,
  EmployeeWithDeductions,
} from "../../../types";
import { useSaveEmployee } from "../../../hooks/useSaveEmployee";
import { useDeleteEmployeeDeduction } from "../../../hooks/useDeleteEmployeeDeduction";
import "./styles.css";
import { useNavigate } from "react-router-dom";
import CancellationModal from "./cancellation-modal";
import DeleteDeductionModal from "./delete-deduction-modal";

export interface DeductionInput {
  deductionType: DeductionTypes;
  deductionAmount: number;
  id?: string;
}

export interface EmployeeFormValues {
  name: string;
  salary: number;
  deductions: readonly DeductionInput[];
}
interface Props {
  initialValues: EmployeeWithDeductions;
  mode: "create" | "edit";
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  salary: Yup.number()
    .min(0, "Salary must be >= 0")
    .required("Salary is required"),
  deductions: Yup.array().of(
    Yup.object({
      deductionType: Yup.mixed<DeductionTypes>().oneOf(
        Object.values(DeductionTypes)
      ),
      deductionAmount: Yup.number().min(0, "Deduction must be >= 0").required(),
    })
  ),
});

const EmployeeForm: React.FC<Props> = ({ initialValues, mode, onSuccess }) => {
  const allTypes = Object.values(DeductionTypes);
  const [selectedNewType, setSelectedNewType] = React.useState<string>("");
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [showDeductionDeleteModal, setShowDeductionDeleteModal] =
    React.useState(false);
  const [selectedDeduction, setSelectedDeduction] =
    React.useState<Deduction | null>(null);
  const [pendingDeductionDeleteIndex, setPendingDeductionDeleteIndex] =
    React.useState<number | null>(null);

  const removeRef = React.useRef<((index: number) => void) | null>(null);

  const getSafeInitialValues = (
    raw: Partial<EmployeeWithDeductions> = {}
  ): EmployeeFormValues => ({
    name: raw.name ?? "",
    salary: raw.salary ?? 0,
    deductions: raw.deductions ?? [],
  });
  const { saveEmployee, error, clearError, loading } = useSaveEmployee();

  const navigate = useNavigate();

  const { deleteEmployeeDeduction } = useDeleteEmployeeDeduction();

  const handleSubmit = (values: EmployeeFormValues) => {
    const id = mode === "edit" ? initialValues.id : undefined;
    saveEmployee(values, mode, id, () => {
      if (onSuccess) {
        onSuccess();
      }
    });
  };

  return (
    <div>
      <Formik
        initialValues={getSafeInitialValues(initialValues)}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, dirty }) => {
          const usedTypes = values.deductions?.map((d) => d.deductionType);
          const availableTypes = allTypes.filter(
            (type) => !usedTypes.includes(type)
          );

          return (
            <Form className="w-100">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <Field name="name">
                  {({ field }: FieldProps) => (
                    <input
                      {...field}
                      className="form-control"
                      onChange={(e) => {
                        clearError(); // clears backend error
                        field.onChange(e); // still updates Formik state
                      }}
                    />
                  )}
                </Field>
                {touched.name && errors.name && (
                  <div className="text-danger">{errors.name}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Salary</label>
                <Field name="salary" type="number" className="form-control" />
                {touched.salary && errors.salary && (
                  <div className="text-danger">{errors.salary}</div>
                )}
              </div>

              <FieldArray name="deductions">
                {({ remove, push }) => {
                  removeRef.current = remove;
                  return (
                    <div>
                      <h5>Deductions</h5>
                      <div className="d-flex flex-column flex-md-row align-items-md-start gap-2">
                        {values.deductions.map((deduction, index) => (
                          <div
                            key={deduction.id ?? index}
                            className="position-relative d-inline-flex align-items-center mb-2 gap-2 border border-info rounded p-3"
                          >
                            <div className="d-flex flex-column gap-2 flex-xl-row">
                              <div>
                                <Field
                                  name={`deductions.${index}.deductionType`}
                                  className="form-control form-control-sm w-auto"
                                  disabled // existing type cannot be changed
                                />
                              </div>
                              <div>
                                <Field
                                  name={`deductions.${index}.deductionAmount`}
                                  type="number"
                                  className="form-control form-control-sm w-auto"
                                />
                              </div>
                            </div>
                            <div className="d-none d-md-block align-self-end">
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={async () => {
                                  if (deduction.id) {
                                    setSelectedDeduction(
                                      deduction as Deduction
                                    );
                                    setPendingDeductionDeleteIndex(index);
                                    setShowDeductionDeleteModal(true);
                                  } else {
                                    remove(index);
                                  }
                                }}
                              >
                                <span
                                  className="material-icons"
                                  style={{ fontSize: "20px" }}
                                >
                                  delete
                                </span>
                              </button>
                            </div>

                            <div className="d-md-none position-absolute top-0 end-0 bottom-0 d-flex align-items-center pe-2">
                              <button
                                type="button"
                                className="btn btn-outline-danger h-50"
                                style={{ aspectRatio: "1 / 1" }}
                                onClick={async () => {
                                  if (deduction.id) {
                                    setSelectedDeduction(
                                      deduction as Deduction
                                    );
                                    setPendingDeductionDeleteIndex(index);
                                    setShowDeductionDeleteModal(true);
                                  } else {
                                    remove(index);
                                  }
                                }}
                              >
                                <span
                                  className="material-icons"
                                  style={{ fontSize: "20px" }}
                                >
                                  delete
                                </span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {availableTypes.length > 0 && (
                        <div className="mt-3">
                          <label className="form-label">Add Deduction</label>
                          <div className="row g-2 align-items-end">
                            <div className="col-6 col-md-4">
                              <select
                                className="form-select"
                                value={selectedNewType}
                                onChange={(e) =>
                                  setSelectedNewType(e.target.value)
                                }
                              >
                                <option value="">Choose type...</option>
                                {availableTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type.replace("_", " ")}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-auto">
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                disabled={!selectedNewType}
                                onClick={() => {
                                  push({
                                    deductionType:
                                      selectedNewType as DeductionTypes,
                                    deductionAmount: 0,
                                  });
                                  setSelectedNewType("");
                                }}
                              >
                                Add Deduction
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              </FieldArray>

              <div className="mt-4 d-flex flex-column flex-md-row gap-2">
                <button
                  type="submit"
                  className="btn btn-primary order-0 order-md-1"
                  style={{ minWidth: "150px " }}
                >
                  {loading ? (
                    <div
                      className="spinner-border border-3 text-white"
                      role="status"
                      style={{ height: "1.25rem", width: "1.25rem" }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : mode === "edit" ? (
                    "Update Employee"
                  ) : (
                    "Create Employee"
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger order-1 order-md-0"
                  onClick={() => {
                    if (dirty) {
                      setShowCancelModal(true);
                    } else {
                      if (initialValues.id) {
                        onSuccess?.();
                      } else {
                        navigate("/");
                      }
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
              {error && error.response?.data && (
                <div className="alert alert-danger mt-4">
                  {error.response?.data?.message}
                </div>
              )}
            </Form>
          );
        }}
      </Formik>
      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => (initialValues.id ? onSuccess?.() : navigate("/"))}
      />
      <DeleteDeductionModal
        isOpen={showDeductionDeleteModal}
        onClose={() => setShowDeductionDeleteModal(false)}
        onConfirm={() => {
          if (selectedDeduction?.id && pendingDeductionDeleteIndex !== null) {
            deleteEmployeeDeduction(selectedDeduction.id);
            removeRef.current?.(pendingDeductionDeleteIndex);
          }
          setSelectedDeduction(null);
          setPendingDeductionDeleteIndex(null);
          setShowDeductionDeleteModal(false);
        }}
        deduction={selectedDeduction}
      />
    </div>
  );
};

export default EmployeeForm;
