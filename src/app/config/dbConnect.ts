import dotenv from "dotenv";
import { Pool } from "pg";
import { envVars } from "./env.js";

dotenv.config();

const connectDB = async () => {
  try {
    const pool = new Pool({
      connectionString: envVars.DATABASE_URL,
    });

    const client = await pool.connect();
    console.log("✅ PostgreSQL Connected Successfully!");
    client.release();

    return pool;
  } catch (error: any) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
