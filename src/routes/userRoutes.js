const express = require('express');
const app = express.Router();
const {
    userRegister, userLogin, userLogout
} = require('../controllers/userController.js')


//user register
app.post('/register', userRegister);

app.post('/login', userLogin);
// Route to log out and blacklist the current token
app.post('/logout', userLogout);

module.exports = app