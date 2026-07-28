require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require('./db');
const companiesRouter = require('./routes/companies');
const contactsRouter = require('./routes/contacts');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Health check — also confirms the RDS connection is alive
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', message: err.message });
  }
});

app.use('/api/companies', companiesRouter);
app.use('/api/contacts', contactsRouter);

// 404 for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Meridian CRM API listening on port ${PORT}`);
});
