// import pkg from "pg";
// const { Client } = pkg;
import dotenv from "dotenv";
import clnupjb from "../components/Utilities/clnpjb.js";
import { Sequelize } from "sequelize";
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });
// console.log(`Environment: ${env}`);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  define: {
    underscored: true, // Use snake_case for all columns
    freezeTableName: true, // Prevent Sequelize from pluralizing table names
  },
});

export default sequelize;

// const pool = new Client({
//   user: process.env.PG_USER,
//   host: process.env.DB_HOST,
//   database: process.env.PG_DB,
//   password: process.env.PG_PASSWORD,
//   port: process.env.DB_PORT || 5432,
// });
// Connect to the Online database
// pool
//   .connect()
//   .then(() => {
//     console.log("Connected to Supabase PostgreSQL database");

// client.release(); // Release the connection

//   })
//   .catch((err) => {
//     console.error("Connection error", err.stack);
//   });

// Connect to the Local database

// pool
//   .connect()
//   .then(() => {
//     console.log("Local Database connected successfully");
//   })
//   .catch((err) => console.error("Database connection failed", err.stack));

// export default pool;

// Define your connection string
// const connectionString =
//   "postgresql://postgres.hkanzffpltbywhnpenwy:postgresdatabase@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";

// // Create a new client instance
// const client = new Client({
//   connectionString: connectionString,
// });
// You can now query the database
// pool.query("SELECT * FROM admins", (err, res) => {
//   if (err) {
//     console.error("Error running query", err.stack);
//   } else {
//     console.log(res.rows);
//   }
//   pool.end();
// });
