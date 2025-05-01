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

describe("DELETE /employee-deductions/:id", () => {
  it("can delete an existing employee deduction", async () => {
    const { deductions } = await seedEmployeeWithDeductions({
      name: "Test User",
      salary: 5000,
      deductions: [
        { deduction_type: DeductionTypes.TAX, deduction_amount: 5000 },
      ],
    });

    const res = await request(app).delete(
      `/api/employee-deductions/${deductions[0].id}`
    );

    expect(res.statusCode).toEqual(204);

    const check = await db("employee_deductions")
      .where({ id: deductions[0].id })
      .first();
    expect(check).toBeUndefined();
  });

  it("throws error if employee id not found", async () => {
    const notFoundId = uuid.v4();

    const res = await request(app).delete(
      `/api/employee-deductions/${notFoundId}`
    );

    expect(res.statusCode).toEqual(404);

    expect(res.body).toMatchObject({
      message: expect.stringMatching(/not found/i),
    });
  });
});
