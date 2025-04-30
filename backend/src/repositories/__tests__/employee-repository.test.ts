import db, {
  setupTestDb,
  cleanTestDb,
  closeTestDb,
} from "../../utils/testing/testDbUtils";

import * as employeeRepo from "../Employee";

describe("Employee Repository", () => {
  beforeAll(async () => {
    await setupTestDb();
    console.log("Connected to DB:", await db.client.config.connection.database);
  });

  beforeEach(async () => {
    await cleanTestDb();
  });
  afterEach(async () => {
    await cleanTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  it("should create a new employee", async () => {
    const newEmployee = await employeeRepo.createNewEmployee({
      name: `Test User`,
      salary: 50000,
    });

    expect(newEmployee).toMatchObject({
      name: "Test User",
      salary: 50000,
    });

    expect(newEmployee.id).toBeDefined();
  });

  it("should find an employee by ID", async () => {
    // manually insert
    const [created] = await db("employees")
      .insert({
        name: "Another User",
        salary: 60000,
      })
      .returning("*");

    const found = await employeeRepo.getEmployeeById(created.id);

    expect(found).toMatchObject({
      id: created.id,
      name: "Another User",
      salary: 60000,
    });
  });

  it("should update an employee", async () => {
    // manually insert
    const [created] = await db("employees")
      .insert({
        name: "Another User",
        salary: 60000,
      })
      .returning("*");

    const updated = await employeeRepo.updateEmployeeById(created.id, {
      name: "New Name",
      salary: 45000,
    });

    expect(updated).toMatchObject({
      id: created.id,
      name: "New Name",
      salary: 45000,
    });
  });

  it("should delete an employee", async () => {
    // manually insert
    const [created] = await db("employees")
      .insert({
        name: "Another User",
        salary: 60000,
      })
      .returning("*");

    const deleted = await employeeRepo.deleteEmployeeById(created.id);
    expect(deleted).toBe(true);

    // try to find the employee
    await expect(employeeRepo.getEmployeeById(created.id)).rejects.toThrow();
  });
});
