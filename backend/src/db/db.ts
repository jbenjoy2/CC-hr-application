import knex from "knex";
import { getKnexConfig } from "./knexConfig";

const environment = process.env.NODE_ENV || "development";
console.log({ environment });

const config = getKnexConfig(environment);
console.log("Connecting to DB:", config.connection);

const db = knex(config);

export default db;
