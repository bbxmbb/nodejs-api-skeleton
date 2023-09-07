const express = require('express');
const app = express.Router();
const {
    authenticateJWT, tokenValidate
} = require('../middlewares/authenticateJWT.js')

// Import the orderInquiryController module 
const {
    getItems, postItems, putItems, deleteItems, getItems2, postItems2
} = require('../controllers/itemController.js')

app.get('/items', authenticateJWT, getItems);

app.get('/items2', getItems2);
//POST method to create an item
app.post('/items', authenticateJWT, postItems);
//POST method to create an item
app.post('/items2', authenticateJWT, postItems2);
// PUT method to update an item
app.put('/items/:id', authenticateJWT, putItems);

// DELETE method to delete an item
app.delete('/items/:id', authenticateJWT, deleteItems);

module.exports = app;