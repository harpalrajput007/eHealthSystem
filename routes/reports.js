const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all reports for authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [reports] = await db.execute(
            'SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.userId]
        );
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single report
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [reports] = await db.execute(
            'SELECT * FROM reports WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.userId]
        );
        if (reports.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json(reports[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new report
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, doctor_name, description, appointment_date, next_appointment_date, note } = req.body;
        const [result] = await db.execute(
            'INSERT INTO reports (user_id, name, doctor_name, description, appointment_date, next_appointment_date, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.userId, name, doctor_name, description, appointment_date, next_appointment_date, note]
        );
        res.status(201).json({ message: 'Report created', reportId: result.insertId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update report
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { name, doctor_name, description, appointment_date, next_appointment_date, note } = req.body;
        const [result] = await db.execute(
            'UPDATE reports SET name = ?, doctor_name = ?, description = ?, appointment_date = ?, next_appointment_date = ?, note = ? WHERE id = ? AND user_id = ?',
            [name, doctor_name, description, appointment_date, next_appointment_date, note, req.params.id, req.user.userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json({ message: 'Report updated' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete report
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.execute(
            'DELETE FROM reports WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json({ message: 'Report deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;