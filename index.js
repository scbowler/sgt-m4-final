const express = require('express');
const PORT = process.env.PORT || 9000;
const db = require('./db');

const app = express();

app.get('/api/test', async (req, res) => {
    const [results] = await db.query('SELECT * FROM grades');

    res.send({
        message: "Test route '/api/test' working!",
        results
    });
});

app.get('/api/grades', async (req, res) => {
    const [grades] = await db.query('SELECT pid, course, grade, name, updated AS lastUpdated FROM grades');

    res.send({ grades });
});

app.listen(PORT, () => {
    console.log('Server listening at localhost:' + PORT);
});
