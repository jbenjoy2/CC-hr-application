import knex, { Knex } from "knex";
import { execSync } from "child_process";
import dotenv from "dotenv";
import { parse } from "pg-connection-string";
import config from "./knexfile";

// ✅ Load .env only in local development
console.log({ env: process.env.NODE_ENV });
if (process.env.NODE_ENV !== "production") {
  const result = dotenv.config();
  if (result.error) {
    console.warn("⚠️ Failed to load .env file:", result.error);
  } else {
    console.log("✅ .env file loaded successfully.");
  }
}

// 🔧 Fallback helper for required local env vars
function requireEnv(varName: string): string {
  const value = process.env[varName];
  if (!value) {
    throw new Error(
      `❌ Required environment variable '${varName}' is missing.`
    );
  }
  return value;
}

// 🔧 Parse connection from DATABASE_URL or local env vars
function getConnectionConfig(
  databaseOverride?: string
): Knex.PgConnectionConfig {
  if (process.env.DATABASE_URL) {
    const parsed = parse(process.env.DATABASE_URL);

    const { host, user, password, port, database } = parsed;

    if (!host || !user || !database) {
      throw new Error(
        "❌ DATABASE_URL is missing required fields (host, user, or database)."
      );
    }

    return {
      host,
      user,
      password,
      database: databaseOverride ?? database,
      port: port ? parseInt(port) : 5432,
      ssl: { rejectUnauthorized: false }, // 🔐 Required on Render
    };
  }

  return {
    host: process.env.DB_HOST || "localhost",
    user: requireEnv("DB_USER"),
    password: process.env.DB_PASS,
    database: databaseOverride ?? requireEnv("DB_NAME"),
    port: Number(process.env.DB_PORT) || 5432,
  };
}

// 🔧 Get DB name + user (used in createdb command)
const dbName = process.env.DATABASE_URL
  ? parse(process.env.DATABASE_URL).database!
  : requireEnv("DB_NAME");
const dbUser = process.env.DATABASE_URL
  ? parse(process.env.DATABASE_URL).user!
  : requireEnv("DB_USER");
const testDbName = process.env.TEST_DB_NAME || undefined;

async function ensureDatabaseAndMigrate(targetDbName: string) {
  console.log(`🔍 Checking if database '${targetDbName}' exists...`);

  const adminDb = knex({
    client: "pg",
    connection: getConnectionConfig("postgres"),
  });

  const result = await adminDb.raw(
    `SELECT 1 FROM pg_database WHERE datname = ?`,
    [targetDbName]
  );

  if (!result.rows.length) {
    console.log(
      `🛠️  Database '${targetDbName}' not found. Attempting to create...`
    );
    try {
      execSync(`createdb ${targetDbName} -U ${dbUser}`);
      console.log(`✅ Database '${targetDbName}' created successfully.`);
    } catch (err) {
      console.error(
        `❌ Failed to create database '${targetDbName}':`,
        (err as Error).message
      );
      throw err;
    }
  } else {
    console.log(`✅ Database '${targetDbName}' already exists.`);
  }

  await adminDb.destroy();

  const dbConnection = knex({
    client: "pg",
    connection: getConnectionConfig(targetDbName),
  });

  try {
    await dbConnection.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    console.log(`✅ UUID extension enabled for '${targetDbName}'.`);
  } catch (err) {
    console.error(
      `❌ Failed to enable UUID extension for '${targetDbName}':`,
      (err as Error).message
    );
    throw err;
  }

  console.log(`🔄 Running migrations on '${targetDbName}'...`);
  try {
    await dbConnection.migrate.latest({
      directory: config.development.migrations?.directory,
    });
    console.log(`✅ Migrations complete on '${targetDbName}'.`);
  } catch (err) {
    console.error(
      `❌ Migration failed for '${targetDbName}':`,
      (err as Error).message
    );
    throw err;
  }

  await dbConnection.destroy();
}

async function setupDatabase() {
  try {
    await ensureDatabaseAndMigrate(dbName);
    if (testDbName) {
      await ensureDatabaseAndMigrate(testDbName);
    } else {
      console.warn("⚠️ TEST_DB_NAME not set. Skipping test database setup.");
    }
  } catch (err) {
    console.error("❌ Error during database setup:", (err as Error).message);
    process.exit(1);
  }
}

setupDatabase();
