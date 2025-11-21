const fs = require("fs");
const path = require("path");
const { pool } = require("../config/db");
require("dotenv").config();


async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log("Starting database initialization...");
    const schemaPath = path.join(__dirname, "../db/schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    console.log("Executing schema.sql...");
    await client.query(schemaSql);

    console.log("✓ Database schema created successfully");
    console.log("✓ Tables created: vendors, vehicles, drivers");
    console.log("✓ Indexes created");
    console.log("✓ Triggers created");
    console.log("✓ Default admin user inserted");
    console.log("\nDatabase initialization completed successfully!");
    console.log("\nDefault admin credentials:");
    console.log("  Email: admin@vendorsystem.com");
    console.log("  Password: admin123");
  }
  catch (error) {
    console.error("Error initializing database:", error);
    console.error("Error details:", error.message);
    process.exit(1);
  }
  finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("\nExiting...");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Fatal error:", err);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
