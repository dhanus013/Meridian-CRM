const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/contacts?search=xyz&company_id=1 — list all contacts, joined with company name
router.get('/', async (req, res, next) => {
  try {
    const { search, company_id } = req.query;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(ct.first_name LIKE ? OR ct.last_name LIKE ? OR ct.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (company_id) {
      conditions.push('ct.company_id = ?');
      params.push(company_id);
    }

    const sql = `
      SELECT ct.id, ct.first_name, ct.last_name, ct.email, ct.phone, ct.job_title,
             ct.notes, ct.created_at, ct.company_id, co.name AS company_name
      FROM contacts ct
      LEFT JOIN companies co ON co.id = ct.company_id
      ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
      ORDER BY ct.last_name ASC, ct.first_name ASC
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT ct.*, co.name AS company_name
       FROM contacts ct
       LEFT JOIN companies co ON co.id = ct.company_id
       WHERE ct.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts — create
router.post('/', async (req, res, next) => {
  try {
    const { company_id, first_name, last_name, email, phone, job_title, notes } = req.body;
    if (!first_name || !first_name.trim() || !last_name || !last_name.trim()) {
      return res.status(400).json({ error: 'First and last name are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO contacts (company_id, first_name, last_name, email, phone, job_title, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [company_id || null, first_name.trim(), last_name.trim(), email || null, phone || null, job_title || null, notes || null]
    );

    const [rows] = await pool.query(
      `SELECT ct.*, co.name AS company_name FROM contacts ct
       LEFT JOIN companies co ON co.id = ct.company_id WHERE ct.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/contacts/:id — update
router.put('/:id', async (req, res, next) => {
  try {
    const { company_id, first_name, last_name, email, phone, job_title, notes } = req.body;
    if (!first_name || !first_name.trim() || !last_name || !last_name.trim()) {
      return res.status(400).json({ error: 'First and last name are required' });
    }

    const [result] = await pool.query(
      `UPDATE contacts
       SET company_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, job_title = ?, notes = ?
       WHERE id = ?`,
      [company_id || null, first_name.trim(), last_name.trim(), email || null, phone || null, job_title || null, notes || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const [rows] = await pool.query(
      `SELECT ct.*, co.name AS company_name FROM contacts ct
       LEFT JOIN companies co ON co.id = ct.company_id WHERE ct.id = ?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
