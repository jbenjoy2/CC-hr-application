import knex, { Knex } from "knex";
import { execSync } from "child_process";
import dotenv from "dotenv";
import fs from "fs";
import { parse } from "pg-connection-string";
import path from "path";
import config from "./knexfile";
import { PoolClient } from "pg";

// ✅ Load .env only in development and show status
if (process.env.NODE_ENV !== "production") {
  const result = dotenv.config();
  if (result.error) {
    console.warn("⚠️ Failed to load .env file:", result.error);
  } else {
    console.log("✅ .env file loaded successfully.");
  }
}

// 🔧 Helper to require specific environment vars (for local fallback)
function requireEnv(varName: string): string {
  const value = process.env[varName];
  if (!value) {
    throw new Error(
      `❌ Required environment variable '${varName}' is missing.`
    );
  }
  return value;
}

// 🔧 Build connection config using DATABASE_URL or individual env vars
function getConnectionConfig(
  baseDb: string = "postgres"
): Knex.PgConnectionConfig {
  if (process.env.DATABASE_URL) {
    const parsed = parse(process.env.DATABASE_URL);
    if (!parsed.host || !parsed.user) {
      throw new Error("❌ Invalid DATABASE_URL: missing host, user");
    }
    return {
      host: parsed.host,
      user: parsed.user,
      password: parsed.password,
      port: parsed.port ? parseInt(parsed.port) : 5432,
      database: baseDb,
      ssl: { rejectUnauthorized: false }, // Required by Render
    };
  }

  return {
    host: process.env.DB_HOST || "localhost",
    database: baseDb,
    user: requireEnv("DB_USER"),
    password: process.env.DB_PASS,
    port: Number(process.env.DB_PORT) || 5432,
  };
}

// 📦 Get target database name and user
let dbName: string;
let dbUser: string;

if (process.env.DATABASE_URL) {
  const parsed = parse(process.env.DATABASE_URL);
  if (!parsed.database || !parsed.user) {
    throw new Error("❌ DATABASE_URL is missing database or user.");
  }
  dbName = parsed.database;
  dbUser = parsed.user;
} else {
  dbName = requireEnv("DB_NAME");
  dbUser = requireEnv("DB_USER");
}

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
