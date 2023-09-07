const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

require("dotenv").config();
const { pool } = require('../models/db.js');

const userRegister = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username is already taken
        const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        // Query the user ID from the database
        const [newUser] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        const userId = newUser[0].id;

        // Create a user object with ID and username
        const user = { id: userId, username };

        // Generate a JWT for the new user
        const newToken = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '30d' });

        // Update the user's currentToken field in the database
        await pool.query('UPDATE users SET currentToken = ? WHERE id = ?', [newToken, userId]);

        res.json({ message: 'Registration successful', newToken });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const userLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate a new JWT for the authenticated user
        const newToken = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '30d' });

        // Update the user's currentToken field in the database
        await pool.query('UPDATE users SET currentToken = ? WHERE id = ?', [newToken, user.id]);

        res.json({ message: 'Login successful', token: newToken });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
const userLogout = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    var userData = await jwt.verify(token, process.env.SECRET_KEY);
    // console.log(decodedClaims.id);
    try {
        // reset token the user's currentToken field in the database
        await pool.query('UPDATE users SET currentToken = ? WHERE id = ?', ['', userData.id]);

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
module.exports = { userRegister, userLogin, userLogout }