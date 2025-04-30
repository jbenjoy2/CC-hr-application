import React, { useState } from "react";
import { EmployeeWithNetPay } from "../../../types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

interface Props {
  readonly employees: EmployeeWithNetPay[];
}

const EmployeesTable: React.FC<Props> = (p) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<EmployeeWithNetPay>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "salary",
      header: "Salary",
      cell: (info) => `$${info.getValue()}`,
    },
    {
      accessorKey: "totalDeductions",
      header: "Total Deductions",
      cell: (info) => `$${info.getValue()}`,
    },
    {
      accessorKey: "netPay",
      header: "Net Pay",
      cell: (info) => `$${info.getValue()}`,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const emp = row.original;
        return (
          <div className="d-flex gap-4 justify-content-center">
            <button
              className="btn p-0 border-0 bg-transparent text-primary"
              onClick={() => console.log("Edit", emp.id)}
              title="Edit"
            >
              <span className="material-icons" style={{ fontSize: "20px" }}>
                edit
              </span>
            </button>
            <button
              className="btn p-0 border-0 bg-transparent text-danger"
              onClick={() => console.log("Delete", emp.id)}
              title="Delete"
            >
              <span className="material-icons" style={{ fontSize: "20px" }}>
                delete
              </span>
            </button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: p.employees,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <div className="table-responsive w-100">
      <table className="table table-bordered table-striped align-middle">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const direction = header.column.getIsSorted();

                return (
                  <th
                    className="text-nowrap"
                    key={header.id}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    style={{ cursor: canSort ? "pointer" : "default" }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {direction === "asc" && " 🔼"}
                    {direction === "desc" && " 🔽"}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="d-flex justify-content-between align-items-center mt-2">
        <div>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div>
          <button
            className="btn btn-sm btn-outline-primary me-2"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeesTable;
