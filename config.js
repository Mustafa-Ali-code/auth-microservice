const sql = require('mssql');
const sqlite3 = require('sqlite3').verbose();

let db; // Will hold SQLite instance

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

const connectDB = async () => {
  if (process.env.USE_SQLITE === 'true') {
    // Only connect to SQLite
    db = new sqlite3.Database('./database.db', (err) => {
      if (err) {
        console.error('❌ Failed to connect to SQLite DB', err);
      } else {
        console.log('✅ Connected to SQLite database');
      }
    });
  } else {
    // Only connect to Azure SQL
    try {
      await sql.connect(config);
      console.log('✅ Connected to Azure SQL Database');
    } catch (err) {
      console.error('❌ Database connection failed:', err);
    }
  }
};

module.exports = { sql, config, connectDB, db };
