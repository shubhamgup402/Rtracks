// config.js
const { Pool } = require('pg'); // Import Pool from pg package

// Create a connection pool to PostgreSQL
const pool = new Pool({
  host: 'localhost',         // Database host (localhost if running locally)
  port: 5432,               // Default PostgreSQL port
  user: 'postgres',         // Database username
  password: 'blogger@123$#', // Database password
  database: 'Rtrack',       // Database name
});

// Test connection and log status
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database successfully');
    release(); // Release client back to pool
  }
});

// Export pool so that it can be used elsewhere in the app
module.exports = pool;
