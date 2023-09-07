const express = require('express');
const app = express.Router();
const {
    authenticateJWT, tokenValidate
} = require('../middlewares/authenticateJWT.js')

//token validate
app.post('/validate', tokenValidate);

module.exports = app;