require("dotenv").config();
const express = require('express');
const { neon } = require("@neondatabase/serverless");
const serverless = require("serverless-http"); // Serverless HTTP for Lambda

const app = express();
const sql = neon(process.env.DATABASE_URL);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Routes
app.get('/', async (req, res) => {
  const searchTerm = req.query.searchTerm || '';

  try {
    const result = await sql`
      SELECT 
        id, name, transaction_date, order_action, company, 
        quantity, total_invested 
      FROM transactions 
      WHERE name ILIKE ${`%${searchTerm}%`} OR company ILIKE ${`%${searchTerm}%`} 
      ORDER BY transaction_date DESC
    `;
    const transactions = result;
    res.render('index', { transactions, searchTerm });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/add/:name', async (req, res) => {
  const { transaction_date, order_action, company, quantity, average_price, remark } = req.body;
  const name = req.params.name;
  const total_invested = quantity * average_price;

  try {
    await sql`
      INSERT INTO transactions (name, transaction_date, order_action, company, quantity, average_price, total_invested, remark) 
      VALUES (${name}, ${transaction_date}, ${order_action}, ${company}, ${quantity}, ${average_price}, ${total_invested}, ${remark})
    `;
    res.redirect('/');
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).send('Error adding transaction');
  }
});

// Export serverless function
module.exports.handler = serverless(app);
