import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("employees", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("name").unique().notNullable();
    table.float("salary").notNullable();
    table.check("salary >= 0");
    table.timestamps(true, true); // created_at and updated_at
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("employees");
}
