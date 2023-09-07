const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const jwtVerify = promisify(jwt.verify);


require("dotenv").config();
const { pool } = require('../models/db.js');

//Middle ware with checking in the database
const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];


    try {
        // Decode the token to get the user's ID
        const decoded = await jwtVerify(token, process.env.SECRET_KEY);

        // Retrieve the user's currentToken from the database based on the decoded user ID
        const [rows] = await pool.query('SELECT currentToken FROM users WHERE id = ?', [decoded.id]);
        const userCurrentToken = rows[0]?.currentToken;

        // Check if the token matches the currentToken from the database
        if (token !== userCurrentToken) {
            return res.status(401).json({ error: 'Invalid token' });
        }


        // Verify the token's signature
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ error: 'Token has expired' });
                }
                return res.status(403).json({ error: 'Invalid token' });
            }
            req.user = decoded;
            next();
        });
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
}
const tokenValidate = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Decode the token to get the user's ID
        const decoded = await jwtVerify(token, process.env.SECRET_KEY);
        // Retrieve the user's currentToken from the database based on the decoded user ID
        const [rows] = await pool.query('SELECT currentToken FROM users WHERE id = ?', [decoded.id]);
        const userCurrentToken = rows[0]?.currentToken;

        // Check if the token matches the currentToken from the database
        if (token !== userCurrentToken) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        // Verify the token's signature
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ error: 'Token has expired' });
                }
                return res.status(403).json({ error: 'Invalid token' });
            }
            req.user = decoded;
            return res.json(decoded);
        });
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
}
module.exports = { authenticateJWT, tokenValidate }