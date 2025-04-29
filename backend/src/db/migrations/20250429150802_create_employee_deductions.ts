import { DeductionTypes } from "../../types";
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("employee_deductions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("employee_id")
      .references("id")
      .inTable("employees")
      .onDelete("CASCADE")
      .notNullable();
    table.enum("deduction_type", Object.values(DeductionTypes)).notNullable();
    table.float("deduction_amount").notNullable().defaultTo(0);
    table.unique(["deduction_type", "employee_id"]);
    table.check("deduction_amount >= 0");
    table.timestamps(true, true); // created_at and updated_at
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("employee_deductions");
}
