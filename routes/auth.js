const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );
        
        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user.id, username: user.username } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user
router.put('/update', authenticateToken, async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username && !password) {
            return res.status(400).json({ error: 'Username or password required' });
        }
        
        let query = 'UPDATE users SET ';
        let params = [];
        
        if (username) {
            query += 'username = ?';
            params.push(username);
        }
        
        if (password) {
            if (username) query += ', ';
            const hashedPassword = await bcrypt.hash(password, 10);
            query += 'password = ?';
            params.push(hashedPassword);
        }
        
        query += ' WHERE id = ?';
        params.push(req.user.userId);
        
        const [result] = await db.execute(query, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete user
router.delete('/delete', authenticateToken, async (req, res) => {
    try {
        const [result] = await db.execute(
            'DELETE FROM users WHERE id = ?',
            [req.user.userId]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;