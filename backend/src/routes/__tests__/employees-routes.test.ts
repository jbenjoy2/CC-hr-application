import request from "supertest";
import app from "../../app"; // adjust path as needed
import db from "../../db/db"; // your knex instance
import { DeductionTypes } from "../../types";
import {
  cleanTestDb,
  seedEmployee,
  seedEmployeeWithDeductions,
} from "../../utils/testing/testDbUtils";
import * as uuid from "uuid";

beforeAll(async () => {
  // set up test db if needed
});

beforeEach(async () => {
  await cleanTestDb();
});

afterAll(async () => {
  await db.destroy(); // clean up
});

describe("POST /employees", () => {
  it("should create a new employee", async () => {
    const res = await request(app).post("/api/employees").send({
      name: "Test User",
      salary: 60000,
      deductions: [],
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: "Test User",
      salary: 60000,
    });
  });
  it("should create a new employee with deductions", async () => {
    const res = await request(app)
      .post("/api/employees")
      .send({
        name: "Test User",
        salary: 60000,
        deductions: [
          {
            deductionType: DeductionTypes.TAX,
            deductionAmount: 100,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: "Test User",
      salary: 60000,
      deductions: [
        {
          deductionType: DeductionTypes.TAX,
          deductionAmount: 100,
        },
      ],
    });
  });
});
describe("GET /employees", () => {
  it("Should fetch all employees with total deductions and net pay numbers", async () => {
    await seedEmployeeWithDeductions({
      name: "Test User",
      salary: 60000,
      deductions: [
        { deduction_type: DeductionTypes.TAX, deduction_amount: 5000 },
        { deduction_type: DeductionTypes.BENEFITS, deduction_amount: 3000 },
      ],
    });

    const res = await request(app).get("/api/employees");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      name: "Test User",
      salary: 60000,
      totalDeductions: 8000,
      netPay: 52000,
    });
  });
});

describe("GET /employees/:id", () => {
  it("should successfully return an employee if found", async () => {
    const { employee, deductions } = await seedEmployeeWithDeductions({
      name: "Test User",
      salary: 50000,
      deductions: [
        {
          deduction_type: DeductionTypes.TAX,
          deduction_amount: 1000,
        },
      ],
    });

    const res = await request(app).get(`/api/employees/${employee.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: employee.id,
      name: employee.name,
      salary: employee.salary,
      deductions: [
        {
          deductionType: deductions[0].deduction_type,
          deductionAmount: deductions[0].deduction_amount,
        },
      ],
    });
  });

  it("should fail if employee not found", async () => {
    const notFoundId = uuid.v4();

    const res = await request(app).get(`/api/employees/${notFoundId}`);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      message: expect.stringMatching(/not found/i),
    });
  });
});

describe("PATCH /employees/:id", () => {
  it("updates name only", async () => {
    const employee = await seedEmployee({
      name: "Test User",
      salary: 50000,
    });

    const res = await request(app)
      .patch(`/api/employees/${employee.id}`)
      .send({ name: "New Name" });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({
      id: employee.id,
      name: "New Name",
      salary: employee.salary,
    });
  });
  it("updates salary only", async () => {
    const employee = await seedEmployee({
      name: "Test User",
      salary: 50000,
    });

    const res = await request(app)
      .patch(`/api/employees/${employee.id}`)
      .send({ salary: employee.salary + 1000 });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({
      id: employee.id,
      name: employee.name,
      salary: employee.salary + 1000,
    });
  });
  it("updates name and salary together", async () => {
    const employee = await seedEmployee({
      name: "Test User",
      salary: 50000,
    });

    const res = await request(app)
      .patch(`/api/employees/${employee.id}`)
      .send({ name: "New Name", salary: employee.salary + 1000 });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({
      id: employee.id,
      name: "New Name",
      salary: employee.salary + 1000,
    });
  });
  it("updates deductions only", async () => {
    const { employee, deductions } = await seedEmployeeWithDeductions({
      name: "Test User",
      salary: 50000,
      deductions: [
        { deduction_amount: 1000, deduction_type: DeductionTypes.TAX },
      ],
    });

    const res = await request(app)
      .patch(`/api/employees/${employee.id}`)
      .send({
        deductions: [
          {
            deductionAmount: deductions[0].deduction_amount - 100,
            deductionType: DeductionTypes.TAX,
          },
        ],
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({
      id: employee.id,
      name: employee.name,
      salary: employee.salary,
      deductions: [
        {
          id: deductions[0].id,
          deductionType: deductions[0].deduction_type,
          deductionAmount: deductions[0].deduction_amount - 100,
        },
      ],
    });
  });
  it("updates all fields together", async () => {
    const { employee, deductions } = await seedEmployeeWithDeductions({
      name: "Test User",
      salary: 50000,
      deductions: [
        { deduction_amount: 1000, deduction_type: DeductionTypes.TAX },
      ],
    });

    const res = await request(app)
      .patch(`/api/employees/${employee.id}`)
      .send({
        name: "New Name",
        salary: employee.salary - 1000,
        deductions: [
          {
            deductionAmount: deductions[0].deduction_amount - 100,
            deductionType: DeductionTypes.TAX,
          },
        ],
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({
      id: employee.id,
      name: "New Name",
      salary: employee.salary - 1000,
      deductions: [
        {
          id: deductions[0].id,
          deductionType: deductions[0].deduction_type,
          deductionAmount: deductions[0].deduction_amount - 100,
        },
      ],
    });
  });
  it("returns 404 if employee does not exist", async () => {
    const badEmployeeId = uuid.v4();

    const res = await request(app)
      .patch(`/api/employees/${badEmployeeId}`)
      .send({
        name: "New Name",
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toMatchObject({
      message: expect.stringMatching(/not found/i),
    });
  });
  it("returns 400 for invalid deduction type", async () => {
    const { employee, deductions } = await seedEmployeeWithDeductions({
      name: "Test User",
      salary: 50000,
      deductions: [
        { deduction_amount: 1000, deduction_type: DeductionTypes.TAX },
      ],
    });

    const res = await request(app)
      .patch(`/api/employees/${employee.id}`)
      .send({
        deductions: [
          {
            deductionAmount: deductions[0].deduction_amount - 100,
            deductionType: "NOT_A_TYPE",
          },
        ],
      });

    expect(res.statusCode).toEqual(400);
  });
  it("sets deductions to 0 if salary is set to 0", async () => {
    const { employee, deductions } = await seedEmployeeWithDeductions({
      name: "Test User",
      salary: 5000,
      deductions: [
        { deduction_amount: 1000, deduction_type: DeductionTypes.TAX },
      ],
    });

    const res = await request(app).patch(`/api/employees/${employee.id}`).send({
      salary: 0,
    });

    expect(res.statusCode).toEqual(200);

    expect(res.body).toMatchObject({
      id: employee.id,
      name: employee.name,
      salary: 0,
      deductions: [
        {
          id: deductions[0].id,
          deductionType: deductions[0].deduction_type,
          deductionAmount: 0,
        },
      ],
    });
  });
});

describe("DELETE /employees/:id", () => {
  it("can delete an existing employee", async () => {
    const employee = await seedEmployee({ name: "Test User", salary: 5000 });

    const res = await request(app).delete(`/api/employees/${employee.id}`);

    expect(res.statusCode).toEqual(204);

    const check = await db("employees").where({ id: employee.id }).first();
    expect(check).toBeUndefined();
  });
  it("can delete an existing employee and associated deductions", async () => {
    const { employee } = await seedEmployeeWithDeductions({
      name: "Test User",
      salary: 5000,
      deductions: [
        { deduction_amount: 100, deduction_type: DeductionTypes.TAX },
      ],
    });

    const res = await request(app).delete(`/api/employees/${employee.id}`);

    expect(res.statusCode).toEqual(204);

    const check = await db("employees").where({ id: employee.id }).first();
    expect(check).toBeUndefined();

    const deductionsCheck = await db("employee_deductions").where({
      employee_id: employee.id,
    });
    expect(deductionsCheck).toHaveLength(0);
  });
  it("throws error if employee id not found", async () => {
    const notFoundId = uuid.v4();

    const res = await request(app).delete(`/api/employees/${notFoundId}`);

    expect(res.statusCode).toEqual(404);

    expect(res.body).toMatchObject({
      message: expect.stringMatching(/not found/i),
    });
  });
});
