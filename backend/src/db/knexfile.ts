import { getKnexConfig } from "./knexConfig";

const environment = process.env.NODE_ENV || "development";

module.exports = getKnexConfig(environment);
