
import dotenv from "dotenv";
import app from "./app.js";
import { pool, testDatabaseConnection } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const database = await testDatabaseConnection();

    console.log(`Connected to database: ${database.database}`);

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error.message);

    await pool.end();
    process.exit(1);
  }
}

startServer();
