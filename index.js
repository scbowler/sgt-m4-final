const express = require('express');
const PORT = process.env.PORT || 9000;
const db = require('./db');
const StatusError = require('./helpers/status_error');
const defaultErrorHandler = require('./middleware/default_error_handler');

const app = express();

app.use(express.urlencoded({extended: false}));

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

app.use(defaultErrorHandler);

app.listen(PORT, () => {
    console.log('Server listening at localhost:' + PORT);
});
