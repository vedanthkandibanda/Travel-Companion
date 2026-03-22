const mysql = require("mysql2");

const config = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "travel_companion",
  port: Number(process.env.DB_PORT || 3306),
  connectTimeout: 10000
};

const db = mysql.createConnection(config);

function connectWithRetry(retries = 5, delayMs = 3000) {
  db.connect((err) => {
    if (err) {
      console.error(`DB Connection Failed ❌ (attempt ${6 - retries}/5)`);
      console.error(err);
      if (retries > 0) {
        console.log(`Retrying in ${delayMs / 1000}s...`);
        setTimeout(() => connectWithRetry(retries - 1, delayMs), delayMs);
      } else {
        console.error("Could not connect to MySQL after 5 attempts. Verify MySQL is running and .env settings are correct.");
        process.exit(1);
      }
    } else {
      console.log("MySQL Connected ✅");
    }
  });
}

connectWithRetry();

module.exports = db;