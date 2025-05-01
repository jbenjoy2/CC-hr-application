import { Knex, knex } from "knex";
import dotenv from "dotenv";
import { PoolClient } from "pg";

dotenv.config();

const makeConnection = (prefix: string = "DB") => ({
  host: process.env[`${prefix}_HOST`] || "localhost",
  database: process.env[`${prefix}_NAME`] || "hr_application",
  user: process.env[`${prefix}_USER`] || "postgres",
  password: process.env[`${prefix}_PASS`] || "password",
  port: Number(process.env[`${prefix}_PORT`] || 5432),
  timezone: "UTC",
});

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: makeConnection("DB"),
    migrations: {
      tableName: "knex_migrations",
      directory: `${__dirname}/migrations`,
    },
    pool: {
      afterCreate: (
        conn: PoolClient,
        done: (err?: Error, conn?: PoolClient) => void
      ) => {
        conn.query("SET TIMEZONE = 'UTC';", (err: any) => {
          done(err, conn);
        });
      },
    },
  },
  test: {
    client: "pg",
    connection: makeConnection("TEST_DB"),
    migrations: {
      tableName: "knex_migrations",
      directory: `${__dirname}/migrations`,
    },
    pool: {
      afterCreate: (
        conn: PoolClient,
        done: (err?: Error, conn?: PoolClient) => void
      ) => {
        conn.query("SET TIMEZONE = 'UTC';", (err: any) => {
          done(err, conn);
        });
      },
    },
  },
  production: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    migrations: {
      tableName: "knex_migrations",
      directory: `${__dirname}/migrations`,
    },
    pool: {
      afterCreate: (
        conn: PoolClient,
        done: (err?: Error, conn?: PoolClient) => void
      ) => {
        conn.query("SET TIMEZONE = 'UTC';", (err: any) => {
          done(err, conn);
        });
      },
    },
  },
};

// Initialize Knex instance
const db = knex(config.development);

// Auto-execute migrations or rollback based on CLI args
const run = async () => {
  const command = process.argv[2]; // Command from CLI (e.g., migrate:latest)
  try {
    if (command === "migrate:latest") {
      const result = await db.migrate.latest();
      console.log("✅ Migrations applied successfully:", result);
    } else if (command === "migrate:rollback") {
      const rollbackAll = process.argv.includes("--all");
      const result = await db.migrate.rollback(undefined, rollbackAll);
      console.log(
        rollbackAll
          ? "✅ All migrations rolled back."
          : "✅ Last batch rolled back:",
        result
      );
    } else {
      console.log(
        "❌ Unknown command. Use 'migrate:latest' or 'migrate:rollback'."
      );
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during migration:", err);
    process.exit(1);
  }
};

// Only run if the file is executed directly
if (require.main === module) {
  run();
}

export default config;
