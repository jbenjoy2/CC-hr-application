import { getKnexConfig } from "./knexConfig";

const environment = process.env.NODE_ENV || "development";
const config = getKnexConfig(environment);
export default config;
