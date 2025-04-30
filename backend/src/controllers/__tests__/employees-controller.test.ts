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
import * as employeeController from "../employees-controller";

describe("Employee controller", () => {
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

  describe("employee creation", () => {
    it("should create an employee with no deductions and have status 201 and return data", async () => {
      const req = createMockReq({
        body: {
          name: "HelperUser",
          salary: 62000,
          deductions: [],
        },
      });

      const res = createMockRes();
      const { next } = createMockNext();

      await employeeController.createEmployee(req, res, next);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        name: "HelperUser",
        salary: 62000,
        id: expect.any(String),
        deductions: [],
      });
    });
    it("should create an employee with deductions and have status 201 and return data", async () => {
      const req = createMockReq({
        body: {
          name: "HelperUser",
          salary: 62000,
          deductions: [{ deductionType: "BENEFITS", deductionAmount: 8 }],
        },
      });

      const res = createMockRes();
      const { next } = createMockNext();

      await employeeController.createEmployee(req, res, next);

      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        name: "HelperUser",
        salary: 62000,
        id: expect.any(String),
        deductions: expect.arrayContaining([
          expect.objectContaining({
            deductionType: DeductionTypes.BENEFITS,
            deductionAmount: 8,
          }),
        ]),
      });
    });
  });
  describe("get all employees", () => {
    it("should retrieve all employees and their net pay", async () => {
      // add employees and deductions to db
      const [employee] = await db("employees")
        .insert({ name: "test Userton", salary: 400 })
        .returning("*");

      await db("employee_deductions").insert({
        deduction_type: DeductionTypes.BENEFITS,
        deduction_amount: 100,
        employee_id: employee.id,
      });

      const req = createMockReq({});

      const res = createMockRes();
      const { next } = createMockNext();

      await employeeController.getAll(req, res, next);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: employee.name,
            salary: employee.salary,
            totalDeductions: 100,
            netPay: employee.salary - 100,
          }),
        ])
      );
    });
  });

  describe("find by id", () => {
    it("should find an employee by id and return their deductions", async () => {
      // add employees and deductions to db
      const [employee] = await db("employees")
        .insert({ name: "test Userton", salary: 400 })
        .returning("*");

      await db("employee_deductions").insert({
        deduction_type: DeductionTypes.BENEFITS,
        deduction_amount: 100,
        employee_id: employee.id,
      });
      const req = createMockReq({
        params: { id: employee.id },
      });

      const res = createMockRes();
      const { next } = createMockNext();

      await employeeController.findById(req, res, next);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        name: employee.name,
        salary: employee.salary,
        deductions: expect.arrayContaining([
          expect.objectContaining({
            deductionAmount: 100,
            deductionType: DeductionTypes.BENEFITS,
          }),
        ]),
      });
    });
    it("should return 404 if no employee found", async () => {
      const badEmployeeId = uuid.v4();
      const req = createMockReq({
        params: { id: badEmployeeId },
      });
      const res = createMockRes();
      const { next, error } = createMockNext();

      await employeeController.findById(req, res, next);

      expect(error()).toBeDefined();
      expect(error()).toMatchObject({
        statusCode: 404,
        message: expect.stringMatching(/not found/i),
      });
    });
  });

  describe("update employee", () => {
    it("should be able to update an employee name and/or salary", async () => {
      const [employee1, employee2, employee3] = await db("employees")
        .insert([
          { name: "test User 1", salary: 400 },
          { name: "test User 2", salary: 300 },
          { name: "test User 3", salary: 200 },
        ])
        .returning("*");

      //   update user 1 name only
      const req1 = createMockReq({
        body: {
          name: "HelperUser 1",
        },
        params: {
          id: employee1.id,
        },
      });

      // update user 2 salary only
      const req2 = createMockReq({
        body: {
          salary: employee2.salary + 100,
        },
        params: {
          id: employee2.id,
        },
      });
      // update user 3 salary and name
      const req3 = createMockReq({
        body: {
          name: "HelperUser 3",
          salary: employee3.salary - 100,
        },
        params: {
          id: employee3.id,
        },
      });

      const res1 = createMockRes();
      const { next: next1 } = createMockNext();

      await employeeController.updateEmployee(req1, res1, next1);

      const res2 = createMockRes();
      const { next: next2 } = createMockNext();

      await employeeController.updateEmployee(req2, res2, next2);

      const res3 = createMockRes();
      const { next: next3 } = createMockNext();

      await employeeController.updateEmployee(req3, res3, next3);

      expect(res1.statusCode).toEqual(200);
      expect(res1.body).toMatchObject({
        id: employee1.id,
        name: "HelperUser 1",
        salary: employee1.salary,
      });
      expect(res2.statusCode).toEqual(200);
      expect(res2.body).toMatchObject({
        id: employee2.id,
        name: employee2.name,
        salary: employee2.salary + 100,
      });
      expect(res3.statusCode).toEqual(200);
      expect(res3.body).toMatchObject({
        id: employee3.id,
        name: "HelperUser 3",
        salary: employee3.salary - 100,
      });
    });

    it("should be able to update deduction values", async () => {
      const [employee] = await db("employees")
        .insert([{ name: "test User", salary: 400 }])
        .returning("*");
      const [deduction] = await db("employee_deductions")
        .insert([
          {
            deduction_amount: 100,
            deduction_type: DeductionTypes.TAX,
            employee_id: employee.id,
          },
        ])
        .returning("*");

      const req = createMockReq({
        body: {
          deductions: [
            {
              deductionType: DeductionTypes.TAX,
              deductionAmount: deduction.deduction_amount - 50,
            },
          ],
        },
        params: {
          id: employee.id,
        },
      });

      const res = createMockRes();
      const { next } = createMockNext();
      await employeeController.updateEmployee(req, res, next);

      expect(res.statusCode).toEqual(200);

      expect(res.body).toMatchObject({
        id: employee.id,
        name: employee.name,
        salary: employee.salary,
        deductions: expect.arrayContaining([
          expect.objectContaining({
            id: deduction.id,
            deductionType: DeductionTypes.TAX,
            deductionAmount: deduction.deduction_amount - 50,
          }),
        ]),
      });
    });

    it("should normalize deductions to minimum values based on salary value", async () => {
      const [employee] = await db("employees")
        .insert([{ name: "test User", salary: 400 }])
        .returning("*");
      const [deduction] = await db("employee_deductions")
        .insert([
          {
            deduction_amount: 100,
            deduction_type: DeductionTypes.TAX,
            employee_id: employee.id,
          },
        ])
        .returning("*");

      const req = createMockReq({
        body: {
          deductions: [
            {
              deductionType: DeductionTypes.TAX,
              deductionAmount: employee.salary + 10, // make deduction larger than salary
            },
          ],
        },
        params: {
          id: employee.id,
        },
      });

      const res = createMockRes();
      const { next } = createMockNext();
      await employeeController.updateEmployee(req, res, next);

      expect(res.statusCode).toEqual(200);

      expect(res.body).toMatchObject({
        id: employee.id,
        name: employee.name,
        salary: employee.salary,
        deductions: expect.arrayContaining([
          expect.objectContaining({
            id: deduction.id,
            deductionType: DeductionTypes.TAX,
            deductionAmount: employee.salary, //should be at maximum (net pay = 0) since the update sent it above salary amount
          }),
        ]),
      });
    });

    it("should throw an error if employee id is not found", async () => {
      const badEmployeeId = uuid.v4();

      const req = createMockReq({
        body: { name: "New Name" },
        params: { id: badEmployeeId },
      });
      const res = createMockRes();
      const { next, error } = createMockNext();

      await employeeController.findById(req, res, next);

      expect(error()).toBeDefined();
      expect(error()).toMatchObject({
        statusCode: 404,
        message: expect.stringMatching(/not found/i),
      });
    });
  });

  describe("delete employee", () => {
    it("should be able to delete an employee", async () => {
      // add employee
      const [employee] = await db("employees")
        .insert({
          name: "Test User",
          salary: 400,
        })
        .returning("*");

      const req = createMockReq({
        params: { id: employee.id },
      });
      const res = createMockRes();
      const { next } = createMockNext();

      await employeeController.deleteEmployee(req, res, next);

      //   check db for result
      const result = await db("employees").where({ id: employee.id }).first();
      expect(res.statusCode).toEqual(204);
      expect(result).toBeUndefined();
    });
    it("should throw not found if employee id does not exist", async () => {
      // add employee
      const badEmployeeId = uuid.v4();
      const req = createMockReq({
        params: { id: badEmployeeId },
      });
      const res = createMockRes();
      const { next, error } = createMockNext();

      await employeeController.deleteEmployee(req, res, next);

      expect(error()).toBeDefined();
      expect(error()).toMatchObject({
        statusCode: 404,
        message: expect.stringMatching(/not found/i),
      });
    });
  });
});
