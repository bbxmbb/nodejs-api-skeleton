const express = require('express');

const mysql = require('mysql');
const app = express();
const port = 3000;
require("dotenv").config();
// const mysql = require('mysql2/promise');
// MySQL Connection Pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
});

// Connect to MySQL
// db.connect((err) => {
//     if (err) {
//         throw err;
//     }
//     console.log('Connected to MySQL database');
// });

// Set the view engine to use EJS
app.set('view engine', 'ejs');

// Define a route to fetch and display items
app.get('/', (req, res) => {
    const query = 'SELECT id, name, description FROM items LIMIT 200'; // Adjust the columns as per your table structure
    db.query(query, (err, results) => {
        if (err) {
            throw err;
        }
        res.render('index', { items: results });
    });
});
const validateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (token && token.startsWith('Bearer ')) {
        const receivedToken = token.split(' ')[1];
        // Here, you can implement your own logic to validate the token
        // For example, you could compare it with the token generated on the frontend
        if (receivedToken === "hhhyyy") {
            return next();
        }
    }
    res.sendStatus(401); // Unauthorized
};
app.get('/fetchdata', validateToken, (req, res) => {
    const query = 'SELECT id, name, description FROM items LIMIT 200'; // Adjust the columns as per your table structure
    db.query(query, (err, results) => {
        if (err) {
            throw err;
        }
        res.json(results);
    });
});
// Import the orderInquiryController module 
const {
    getItems, postItems, putItems, deleteItems, getItems2, postItems2
} = require('./src/controllers/itemController.js')


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
