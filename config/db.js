const mysql = require("mysql2");

// Use a Pool for better performance in production environments like Google/Amazon
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 14892, // Matches Aiven default from your screenshot
  ssl: {
    rejectUnauthorized: false // Required for Aiven Cloud security
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verification log to ensure the 'heart' of your system is beating
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    console.log("TRAP: Check if your IP is whitelisted (0.0.0.0/0) and DB is powered ON.");
  } else {
    console.log("✅ Database Connected Successfully to Aiven Cloud");
    connection.release(); // Always release the connection back to the pool
  }
});

// EXTREMELY IMPORTANT: Exporting .promise() allows you to use 'await db.query'
module.exports = db.promise();