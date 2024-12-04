import pkg from "pg";
import dotenv from "dotenv";
import clnupjb from "./clnpjb.js";
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });
console.log(`Environment: ${env}`);

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PG_USER,
  host: "localhost",
  database: process.env.PG_DB,
  password: process.env.PG_PASSWORD,
  port: process.env.DB_PORT || 5432,
});
pool
  .connect()
  .then((client) => {
    console.log("Database connected successfully");

    client.release(); // Release the connection
  })
  .catch((err) => console.error("Database connection failed", err.stack));

export default pool;
