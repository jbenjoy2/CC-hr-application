import knex from "knex";
import config from "./knexfile";
import { execSync } from "child_process";
import dotenv from "dotenv";
import fs from "fs";
const result = dotenv.config({ path: `${__dirname}/../../.env` });

if (result.error) {
  console.error("❌ Failed to load .env file:", result.error);
} else {
  console.log("✅ .env file loaded successfully.");
}
console.log(`DB_NAME from .env: ${process.env.DB_NAME}`);

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

async function setupDatabase() {
  const dbName = process.env.DB_NAME;
  const dbUser = process.env.DB_USER;

  try {
    console.log(`🔍 Checking if database '${dbName}' exists...`);

    // 1. Check if the target database exists
    const result = await db.raw(`SELECT 1 FROM pg_database WHERE datname = ?`, [
      dbName,
    ]);

    if (!result.rows.length) {
      console.log(
        `🛠️  Database '${dbName}' not found. Attempting to create...`
      );

      // 2. Create the database if it doesn't exist
      try {
        execSync(`createdb ${dbName} -U ${dbUser}`);
        console.log(`✅ Database '${dbName}' created successfully.`);
      } catch (err) {
        const dbCreateError = err as Error;
        console.error(`❌ Failed to create database: ${dbCreateError.message}`);
        throw dbCreateError;
      }
    } else {
      console.log(`✅ Database '${dbName}' already exists.`);
    }

    // 3. Connect to the created database and enable UUID extension
    console.log(`🔌 Connecting to database to enable UUID extension...`);
    const dbConnection = knex({
      client: "pg",
      connection: {
        host: process.env.DB_HOST,
        database: dbName, // Connect to the target database now
        user: dbUser,
        password: process.env.DB_PASS,
        port: Number(process.env.DB_PORT) || 5432,
      },
    });

    try {
      await dbConnection.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      console.log(`✅ UUID extension enabled.`);
    } catch (err) {
      const uuidError = err as Error;
      console.error(`❌ Failed to enable UUID extension: ${uuidError.message}`);
      throw uuidError;
    }

    // 4. Run migrations
    console.log(`🔄 Running migrations...`);
    try {
      await dbConnection.migrate.latest({
        directory: config.development.migrations?.directory,
      });
      console.log(`✅ Migrations complete.`);
    } catch (err) {
      const migrationError = err as Error;
      console.error(`❌ Migration failed: ${migrationError.message}`);
      throw migrationError;
    }

    // 5. (Optional) Run seeds
    console.log(`🌱 Running seed files...`);

    const seedDirectory = config.development.seeds?.directory;
    if (typeof seedDirectory === "string" && fs.existsSync(seedDirectory)) {
      console.log(`🌱 Running seed files...`);
      await dbConnection.seed.run({
        directory: config.development.seeds?.directory,
      });
      console.log(`✅ Seeding complete.`);
    } else {
      console.log(`⚠️  No seed files found. Skipping seeding.`);
    }

    dbConnection.destroy();
  } catch (err) {
    const setupError = err as Error;
    console.error("❌ Error during database setup:", setupError.message);
  } finally {
    db.destroy();
  }
}

setupDatabase();
