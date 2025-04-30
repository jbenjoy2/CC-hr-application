import knex from "knex";
import config from "./knexfile";
import { execSync } from "child_process";
import dotenv from "dotenv";
import fs from "fs";
const result = dotenv.config({ path: `${__dirname}/../../.env` });
function requireEnv(varName: string): string {
  const value = process.env[varName];
  if (!value) {
    throw new Error(
      `❌ Required environment variable '${varName}' is missing.`
    );
  }
  return value;
}

const dbName = requireEnv("DB_NAME");
const dbUser = requireEnv("DB_USER");
const testDbName = process.env.TEST_DB_NAME; // optional
if (result.error) {
  console.error("❌ Failed to load .env file:", result.error);
} else {
  console.log("✅ .env file loaded successfully.");
}
console.log(`DB_NAME from .env: ${process.env.DB_NAME}`);

if (!dbName) {
  throw new Error("❌ DB_NAME is not defined in environment variables.");
}
if (!dbUser) {
  throw new Error("❌ DB_USER is not defined in environment variables.");
}

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    database: "postgres", // Connect to the default database first
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: Number(process.env.DB_PORT) || 5432,
  },
});

async function ensureDatabaseAndMigrate(targetDbName: string) {
  console.log(`🔍 Checking if database '${targetDbName}' exists...`);

  const result = await db.raw(`SELECT 1 FROM pg_database WHERE datname = ?`, [
    targetDbName,
  ]);

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

  // Connect to the specific database
  const dbConnection = knex({
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      database: targetDbName,
      user: dbUser,
      password: process.env.DB_PASS,
      port: Number(process.env.DB_PORT) || 5432,
    },
  });

  // Enable UUID extension
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

  // Run migrations
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

  dbConnection.destroy();
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
  } finally {
    db.destroy();
  }
}

setupDatabase();
