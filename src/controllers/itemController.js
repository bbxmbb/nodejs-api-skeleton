require("dotenv").config();
const { pool } = require('../models/db.js');
const redis = require('redis');
const _ = require('lodash');
// const redis_server = require('../redis_server');
// const redisServer = new redis_server();
// Create a Redis client
const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379 // Default Redis port
});
redisClient.connect();

redisClient.on('error', err => {
    console.log('Error ' + err);
});
// GET method to retrieve all items
const getItems = async (req, res) => {
    // const {name} = req.query;
    const name = req.query.name;
    const pageSize = parseInt(req.query.pageSize) || 1000;
    const pageNumber = (parseInt(req.query.pageNumber - 1) || 0) * pageSize;
    let query;
    if (name) {
        query = `SELECT * FROM items WHERE name LIKE '%${name}%' LIMIT ${pageSize} OFFSET ${pageNumber}`;
    } else {
        query = `SELECT * FROM items  LIMIT ${pageSize} OFFSET ${pageNumber}`;
    }
    try {
        // const [rows] = await pool.query(query, [`%${name}%`, pageSize, pageNumber]);
        // res.json(rows);

        // Query data from the database
        const [rows] = await pool.query(query);

        // Format the data (if needed)
        const formattedData = rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            stringValue: row.string,
            numberValue: row.number,
            booleanValue: Boolean(row.bool),
            arrayValue: JSON.parse(row.array),
            objectValue: JSON.parse(row.object)
        }));
        // Respond with JSON
        res.json(createApiResponse("success", 200, "Request successful", formattedData));
    } catch (error) {
        console.error(error);

        res.status(500).json(createApiResponse("error", 500, "Internal server error", NULL));
    }
}
const getItems2 = async (req, res) => {

    const name = req.query.name;
    const pageSize = parseInt(req.query.pageSize) || 1000;
    const pageNumber = (parseInt(req.query.pageNumber - 1) || 0) * pageSize;
    if (name) {
        query = `SELECT * FROM items WHERE name LIKE '%${name}%' LIMIT ${pageSize} OFFSET ${pageNumber}`;
    } else {
        query = `SELECT * FROM items  LIMIT ${pageSize} OFFSET ${pageNumber}`;
    }

    const cacheKey = `pagination:${pageNumber}:${pageSize}`;
    const data = JSON.parse(await redisClient.get(cacheKey));
    if (data !== null) {
        // Data is cached, send the cached data
        // Format the data (if needed)
        const formattedData = data.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            stringValue: row.string,
            numberValue: row.number,
            booleanValue: Boolean(row.bool),
            arrayValue: JSON.parse(row.array),
            objectValue: JSON.parse(row.object)
        }));
        res.setHeader('X-Data-Source', 'Cache');
        res.json(createApiResponse("success", 200, "Request successful", formattedData));
    } else {

        const [rows] = await pool.query(query);
        // Cache the items in Redis
        await redisClient.setEx(cacheKey, 60, JSON.stringify(rows));

        const formattedData = rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            stringValue: row.string,
            numberValue: row.number,
            booleanValue: Boolean(row.bool),
            arrayValue: JSON.parse(row.array),
            objectValue: JSON.parse(row.object)
        }));
        // console.log("Data from cache: false");
        // Send the fetched data
        res.json(createApiResponse("success", 200, "Request successful", formattedData));
    }
}
const postItems = async (req, res) => {
    const { name, description, stringValue, numberValue, booleanValue, arrayValue, objectValue } = req.body;

    if (!name || !description) {
        res.status(400).json(createApiResponse("error", 400, "Missing required fields", NULL));
        return;
    }
    // Validate and sanitize the values
    if (typeof stringValue !== 'string') {

        return res.status(400).json(createApiResponse("error", 400, "Invalid data types for string", NULL));
    }
    if (isNaN(numberValue)) {
        return res.status(400).json(createApiResponse("error", 400, "Invalid data types for number", NULL));
    }
    if (typeof booleanValue !== 'boolean') {
        return res.status(400).json(createApiResponse("error", 400, "Invalid data types for boolean", NULL));
    }
    if (!Array.isArray(arrayValue)) {
        return res.status(400).json(createApiResponse("error", 400, "Invalid data types for array", NULL));
    } else if (!arrayContainsOnly(arrayValue, 'string', 2)) {
        return res.status(400).json(createApiResponse("error", 400, "Invalid data types for array", NULL));
    }

    const expectedKeys = ['firstKey', 'secondKey'];
    const expectedDataTypes = ['string', 'number'];

    if (typeof objectValue !== 'object') {
        return res.status(400).json(createApiResponse("error", 400, "Invalid data types for object", NULL));
    } else if (!isValidObjectFormat(objectValue, expectedKeys, expectedDataTypes)) {
        return res.status(400).json(createApiResponse("error", 400, "Invalid data types for object", NULL));
    }

    // Insert into the database
    try {
        const connection = await pool.getConnection();

        await connection.query('INSERT INTO items (name,description,string, number, bool, array,object) VALUES (?, ?, ?, ?, ?, ?,?)', [name, description, stringValue, numberValue, booleanValue, JSON.stringify(arrayValue), JSON.stringify(objectValue)]);

        connection.release();

        res.status(201).json(createApiResponse("success", 201, "Data Inserted successful", req.body));
    } catch (error) {
        console.error(error);
        res.status(500).json(createApiResponse("error", 500, "Internal server error", NULL));
    }
}
const postItems2 = async (req, res) => {
    const { name, description, stringValue, numberValue, booleanValue, arrayValue, objectValue } = req.body;

    if (!name || !description) {
        res.status(400).json(createApiResponse("error", 400, "Missing required fields", NULL));
        return;
    }
    // Validate and sanitize the values
    if (typeof stringValue !== 'string') {

        return res.status(400).json(createApiResponse("error", 400, "Invalid data types for string", NULL));
    }
    if (isNaN(numberValue)) {
        return res.status(400).json(createApiResponse("error", 400, "Invalid data types for number", NULL));
    }
    if (typeof booleanValue !== 'boolean') {
        return res.status(400).json(createApiResponse("error", 400, "Invalid data types for boolean", NULL));
    }
    if (!Array.isArray(arrayValue)) {
        return res.status(400).json(createApiResponse("error", 400, "Invalid data types for array", NULL));
    } else if (!arrayContainsOnly(arrayValue, 'string', 2)) {
        return res.status(400).json(createApiResponse("error", 400, "Invalid data types for array", NULL));
    }

    const expectedKeys = ['firstKey', 'secondKey'];
    const expectedDataTypes = ['string', 'number'];

    if (typeof objectValue !== 'object') {
        return res.status(400).json(createApiResponse("error", 400, "Invalid data types for object", NULL));
    } else if (!isValidObjectFormat(objectValue, expectedKeys, expectedDataTypes)) {
        return res.status(400).json(createApiResponse("error", 400, "Invalid data types for object", NULL));
    }

    // Insert into the database
    try {
        const pageSize = parseInt(req.query.pageSize) || 1000;
        const pageNumber = (parseInt(req.query.pageNumber - 1) || 0) * pageSize;
        if (name) {
            query = `SELECT * FROM items WHERE name LIKE '%${name}%' LIMIT ${pageSize} OFFSET ${pageNumber}`;
        } else {
            query = `SELECT * FROM items  LIMIT ${pageSize} OFFSET ${pageNumber}`;
        }


        const connection = await pool.getConnection();

        await connection.query('INSERT INTO items (name,description,string, number, bool, array,object) VALUES (?, ?, ?, ?, ?, ?,?)', [name, description, stringValue, numberValue, booleanValue, JSON.stringify(arrayValue), JSON.stringify(objectValue)]);
        const [rows] = await pool.query(query);
        // Calculate total records and update cache
        const totalRecords = rows.length;

        connection.release();
        const totalPages = Math.ceil(totalRecords / pageSize);
        const cacheKey = `pagination:${pageNumber}:${pageSize}`;

        await redisClient.setEx(cacheKey, 60, JSON.stringify(rows));
        // res.json(rows);
        res.json(createApiResponse("success", 200, "Item Insert Successfully", req.body));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const putItems = async (req, res) => {
    const itemId = req.params.id;
    const { name, description } = req.body;
    if (!name || !description) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    try {
        await pool.query('UPDATE items SET name = ?, description = ? WHERE id = ?', [name, description, itemId]);
        res.json({ message: 'Item updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
const deleteItems = async (req, res) => {
    const itemId = req.params.id;

    try {
        await pool.query('DELETE FROM items WHERE id = ?', [itemId]);
        res.json(createApiResponse("success", 200, "Items deleted"));
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
function arrayContainsOnly(arr, expectedDataTypes, length) {
    if (arr.length > length || arr.length < length) {
        return false;
    }
    if (expectedDataTypes == 'string' || expectedDataTypes == 'number') {

        for (let i = 0; i < arr.length; i++) {
            if (typeof arr[i] !== expectedDataTypes) {
                return false;
            }
        }
        return true;
    } else if (expectedDataTypes == 'object') {
        for (let i = 0; i < arr.length; i++) {
            if (typeof arr[i] !== 'object' || Array.isArray(arr[i]) || arr[i] === null) {
                return false;
            }
        }
        return true;
    }
}
function isValidObjectFormat(obj, expectedKeys, expectedDataTypes) {
    if (
        typeof obj !== 'object' ||
        obj === null ||
        Array.isArray(obj) ||
        !Array.isArray(expectedKeys) ||
        expectedKeys.length !== Object.keys(obj).length ||
        !Array.isArray(expectedDataTypes) ||
        expectedKeys.length !== expectedDataTypes.length
    ) {
        return false;
    }

    for (let i = 0; i < expectedKeys.length; i++) {
        const key = expectedKeys[i];
        const expectedDataType = expectedDataTypes[i];

        if (!obj.hasOwnProperty(key)) {
            return false;
        }

        const actualValueType = typeof obj[key];
        if (actualValueType !== expectedDataType) {
            return false;
        }
    }
    return true;
}
function createApiResponse(status, code, message, data = null) {
    const response = {
        status,
        code,
        message,
        data
    };
    return response;
}
module.exports = { getItems, postItems, putItems, deleteItems, getItems2, postItems2 }
