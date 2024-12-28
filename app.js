const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// Configure the database connection pool
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'blogger@123$#',
  database: 'Rtrack',
});

// Middleware to parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Home route with search functionality
app.get('/', async (req, res) => {
  const searchTerm = req.query.searchTerm || ''; // Get search term from query string

  try {
    const result = await pool.query(
      `
      SELECT 
        id, name, transaction_date, order_action, company, 
        quantity, total_invested 
      FROM transactions 
      WHERE name ILIKE $1 OR company ILIKE $1 
      ORDER BY transaction_date DESC
      `,
      [`%${searchTerm}%`]
    );

    const transactions = result.rows;
    res.render('index', { transactions, searchTerm });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to display the add transaction form
app.get('/add/:name', (req, res) => {
  const name = req.params.name;
  res.render('addTransaction', { name }); // Render the form with the name parameter
});

// Route to handle form submission and add a new transaction
app.post('/add/:name', async (req, res) => {
  const { transaction_date, order_action, company, quantity, average_price, remark } = req.body;
  const name = req.params.name;
  const total_invested = quantity * average_price;

  const query = `
    INSERT INTO transactions (name, transaction_date, order_action, company, quantity, average_price, total_invested, remark) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  const values = [name, transaction_date, order_action, company, quantity, average_price, total_invested, remark];

  try {
    await pool.query(query, values);
    res.redirect('/');
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).send('Error adding transaction');
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
