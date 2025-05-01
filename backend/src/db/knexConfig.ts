import type { Knex } from "knex";
import { PoolClient } from "pg";
import { parse } from "pg-connection-string";
import dotenv from "dotenv";

// Only load .env when run directly (not when imported by knex CLI)
if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production") {
  dotenv.config();
}

function getProductionConnection(): Knex.PgConnectionConfig {
  if (!process.env.DATABASE_URL) {
    throw new Error("❌ DATABASE_URL is not defined in environment variables.");
  }

  const parsed = parse(process.env.DATABASE_URL);
  const { host, user, password, database, port } = parsed;

  if (!host || !user || !database) {
    throw new Error("❌ DATABASE_URL is missing host, user, or database.");
  }

  return {
    host,
    user,
    password,
    database,
    port: port ? parseInt(port) : 5432,
    ssl: { rejectUnauthorized: false },
  };
}

const makeConnection = (prefix: string = "DB") => ({
  host: process.env[`${prefix}_HOST`] || "localhost",
  database: process.env[`${prefix}_NAME`] || "hr_application",
  user: process.env[`${prefix}_USER`] || "postgres",
  password: process.env[`${prefix}_PASS`] || "password",
  port: Number(process.env[`${prefix}_PORT`] || 5432),
  timezone: "UTC",
});

export const getKnexConfig = (env: string): Knex.Config => {
  if (env === "production") {
    return {
      client: "pg",
      connection: getProductionConnection(),
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
    };
  }

  const prefix = env === "test" ? "TEST_DB" : "DB";

  return {
    client: "pg",
    connection: makeConnection(prefix),
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
  };
};
