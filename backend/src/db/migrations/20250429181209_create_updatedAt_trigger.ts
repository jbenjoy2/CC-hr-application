import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. Create the trigger function to update the 'updated_at' column
  await knex.raw(`
    CREATE OR REPLACE FUNCTION set_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // 2. Apply the trigger to all existing tables with an 'updated_at' column
  await knex.raw(`
    DO $$ DECLARE
      table_name TEXT;
    BEGIN
      FOR table_name IN
        SELECT c.table_name
        FROM information_schema.columns c
        WHERE c.column_name = 'updated_at'
      LOOP
        EXECUTE format(
          'CREATE TRIGGER set_%I_updated_at
           BEFORE UPDATE ON %I
           FOR EACH ROW
           EXECUTE FUNCTION set_updated_at_column();',
          table_name, table_name
        );
      END LOOP;
    END $$;
  `);
}

export async function down(knex: Knex): Promise<void> {
  // 1. Drop all triggers associated with 'updated_at' columns
  await knex.raw(`
    DO $$ DECLARE
      table_name TEXT;
    BEGIN
      FOR table_name IN
        SELECT c.table_name
        FROM information_schema.columns c
        WHERE c.column_name = 'updated_at'
      LOOP
        EXECUTE format(
          'DROP TRIGGER IF EXISTS set_%I_updated_at ON %I;',
          table_name, table_name
        );
      END LOOP;
    END $$;
  `);

  // 2. Drop the trigger function
  await knex.raw(`DROP FUNCTION IF EXISTS set_updated_at_column;`);
}
