require("dotenv").config();
const express = require('express');
const cors = require('cors'); //allow access for all domains 

const itemRoutes = require('./src/routes/itemRoutes');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', itemRoutes);
app.use('/', userRoutes);
app.use('/', authRoutes);



app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index');
})
// Middleware for handling non-existing paths
app.use((req, res) => {
    res.status(404).json({ error: 'Path not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong' });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});