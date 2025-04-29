import knex from "knex";
import config from "./knexfile";
console.log("Connecting to DB:", config.development.connection);
const db = knex(config.development);

export default db;
