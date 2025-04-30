import { DeductionTypes } from "../../types";
import db, {
  setupTestDb,
  cleanTestDb,
  closeTestDb,
} from "../../utils/testing/testDbUtils";

import * as employeeDeductionRepo from "../EmployeeDeduction";

describe("EmployeeDeduction Repository", () => {
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

  it("should get all deductions for a given employee", async () => {
    // add an employee
    const [createdEmployee] = await db("employees")
      .insert({
        name: "Another User",
        salary: 60000,
      })
      .returning(["id"]);

    //  add in deductions for that employee
    const createdDeductions = await db("employee_deductions")
      .insert([
        {
          deduction_type: DeductionTypes.TAX,
          deduction_amount: 100,
          employee_id: createdEmployee.id,
        },
        {
          deduction_type: DeductionTypes.BENEFITS,
          deduction_amount: 200,
          employee_id: createdEmployee.id,
        },
      ])
      .returning("*");

    const deductionsForEmployee =
      await employeeDeductionRepo.getAllDeductionsByEmployeeId(
        createdEmployee.id
      );

    expect(deductionsForEmployee).toHaveLength(2);

    expect(deductionsForEmployee).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          deduction_type: DeductionTypes.TAX,
          deduction_amount: 100,
          employee_id: createdEmployee.id,
        }),
      ])
    );
  });

  it("should create one or many new deductions for a new employee", async () => {
    const [createdEmployee1] = await db("employees")
      .insert({
        name: "Another User",
        salary: 60000,
      })
      .returning(["id"]);
    const [createdEmployee2] = await db("employees")
      .insert({
        name: "Another User 2",
        salary: 20000,
      })
      .returning(["id"]);

    // create new deductions
    const createdDeductionSingular =
      await employeeDeductionRepo.createOrUpdateEmployeeDeductions(
        createdEmployee1.id,
        [{ deduction_amount: 100, deduction_type: DeductionTypes.TAX }]
      );

    expect(createdDeductionSingular).toHaveLength(1);
    expect(createdDeductionSingular[0]).toMatchObject({
      deduction_amount: 100,
      deduction_type: DeductionTypes.TAX,
    });
    expect(createdDeductionSingular[0].id).toBeDefined();

    const createdDeductionsMultiple =
      await employeeDeductionRepo.createOrUpdateEmployeeDeductions(
        createdEmployee2.id,
        [
          { deduction_amount: 200, deduction_type: DeductionTypes.TAX },
          { deduction_amount: 20, deduction_type: DeductionTypes.OTHER },
        ]
      );

    expect(createdDeductionsMultiple).toHaveLength(2);
    expect(createdDeductionsMultiple).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          deduction_amount: 200,
          deduction_type: DeductionTypes.TAX,
          employee_id: createdEmployee2.id,
        }),
      ])
    );
  });

  it("should be able to update an existing deduction for a given employee if the value has changed", async () => {
    const [createdEmployee] = await db("employees")
      .insert({
        name: "Another User",
        salary: 60000,
      })
      .returning(["id"]);

    await employeeDeductionRepo.createOrUpdateEmployeeDeductions(
      createdEmployee.id,
      [{ deduction_amount: 100, deduction_type: DeductionTypes.TAX }]
    );

    const updatedDeduction =
      await employeeDeductionRepo.createOrUpdateEmployeeDeductions(
        createdEmployee.id,
        [{ deduction_amount: 150, deduction_type: DeductionTypes.TAX }]
      );

    // check db for employee deductions
    const employeeDeductions = await db("employee_deductions")
      .select("*")
      .where({ employee_id: createdEmployee.id });
    expect(employeeDeductions).toHaveLength(1);
    expect(employeeDeductions).toMatchObject(updatedDeduction);
  });
});
