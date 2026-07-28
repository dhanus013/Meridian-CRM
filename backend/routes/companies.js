const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/companies?search=xyz — list all companies with a contact count
router.get('/', async (req, res, next) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;

    const sql = `
      SELECT c.id, c.name, c.industry, c.website, c.phone, c.address, c.created_at,
             COUNT(ct.id) AS contact_count
      FROM companies c
      LEFT JOIN contacts ct ON ct.company_id = c.id
      ${search ? 'WHERE c.name LIKE ? OR c.industry LIKE ?' : ''}
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    const params = search ? [search, search] : [];

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/companies/:id — one company plus its contacts
router.get('/:id', async (req, res, next) => {
  try {
    const [companyRows] = await pool.query('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    if (companyRows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const [contactRows] = await pool.query(
      'SELECT id, first_name, last_name, email, phone, job_title FROM contacts WHERE company_id = ? ORDER BY last_name ASC',
      [req.params.id]
    );

    res.json({ ...companyRows[0], contacts: contactRows });
  } catch (err) {
    next(err);
  }
});

// POST /api/companies — create
router.post('/', async (req, res, next) => {
  try {
    const { name, industry, website, phone, address } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO companies (name, industry, website, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), industry || null, website || null, phone || null, address || null]
    );

    const [rows] = await pool.query('SELECT * FROM companies WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/companies/:id — update
router.put('/:id', async (req, res, next) => {
  try {
    const { name, industry, website, phone, address } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const [result] = await pool.query(
      'UPDATE companies SET name = ?, industry = ?, website = ?, phone = ?, address = ? WHERE id = ?',
      [name.trim(), industry || null, website || null, phone || null, address || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const [rows] = await pool.query('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/companies/:id — remove (contacts keep their record, company_id set to NULL)
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM companies WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
