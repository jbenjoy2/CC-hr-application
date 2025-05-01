import { DeductionTypes } from "../../types";
import db, {
  setupTestDb,
  cleanTestDb,
  closeTestDb,
  createMockRes,
  createMockNext,
  createMockReq,
} from "../../utils/testing/testDbUtils";
import * as uuid from "uuid";
import * as employeeDeductionController from "../employee-deductions-controller";

describe("Employee deduction controller", () => {
  beforeAll(async () => {
    await setupTestDb();
    console.log("Connected to DB:", await db.client.config.connection.database);
  });

  beforeEach(async () => {
    await cleanTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  describe("delete employee deduction", () => {
    it("should be able to delete an employee deduction", async () => {
      // add employee
      const [employee] = await db("employees")
        .insert({
          name: "Test User",
          salary: 400,
        })
        .returning("*");

      // add deduction
      const [deduction] = await db("employee_deductions")
        .insert({
          employee_id: employee.id,
          deduction_type: DeductionTypes.TAX,
          deduction_amount: 100,
        })
        .returning(["id"]);

      const req = createMockReq({
        params: { id: deduction.id },
      });
      const res = createMockRes();
      const { next } = createMockNext();

      await employeeDeductionController.deleteEmployeeDeduction(req, res, next);

      //   check db for result
      const result = await db("employee_deductions")
        .where({ id: deduction.id })
        .first();
      expect(res.statusCode).toEqual(204);
      expect(result).toBeUndefined();
    });
    it("should throw not found if employee id does not exist", async () => {
      // add employee
      const badDeductionId = uuid.v4();
      const req = createMockReq({
        params: { id: badDeductionId },
      });
      const res = createMockRes();
      const { next, error } = createMockNext();

      await employeeDeductionController.deleteEmployeeDeduction(req, res, next);

      expect(error()).toBeDefined();
      expect(error()).toMatchObject({
        statusCode: 404,
        message: expect.stringMatching(/not found/i),
      });
    });
  });
});
