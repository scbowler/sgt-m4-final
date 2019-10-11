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
    const [records] = await db.query('SELECT pid, course, grade, name, updated AS lastUpdated FROM grades');

    res.send({ records });
});

app.post('/api/grades', async (req, res, next) => {
    try {
        const { course, grade, name } = req.body;
        const errors = [];

        if(!course){
            errors.push('No course name received');
        }
        if (!name) {
            errors.push('No student name received');
        }
        if (!grade) {
            errors.push('No course grade received');
        } else if(isNaN(grade) || grade < 0 || grade > 100){
            errors.push(`Course grade must be a number between 0 and 100 inclusive. ${grade} is invalid.`);
        }

        if(errors.length){
            throw new StatusError(422, errors);
        }

        const [result] = await db.execute('INSERT INTO grades (pid, course, grade, name) VALUES (UUID(), ?, ?, ?)', [course, grade, name]);
        let record = null;

        if(result.affectedRows){
            const [[r]] = await db.query('SELECT pid, course, grade, name, updated AS lastUpdated FROM grades WHERE id=?', [result.insertId]);

            record = r;
        } else {
            throw new StatusError(500, 'Error saving record');
        }

        res.send({
            message: 'New student grade record created successfully',
            record
        });
    } catch(error){
        next(error);
    }
});

app.patch('/api/grades/:record_pid', async (req, res, next) => {
    try {
        const { body, params: { record_pid } } = req;
        const whiteList = ['course', 'grade', 'name'];
        let hasUpdates = false;

        const [[record = null]] = await db.execute('SELECT id FROM grades WHERE pid=?', [record_pid]);

        if(!record) throw new StatusError(404, `No record found with an ID of: ${record_pid}`);

        let query = 'UPDATE grades SET';
        const values = [];

        whiteList.forEach(col => {
            const value = body[col];

            if(value){
                hasUpdates = true;

                if(col === 'grade'){
                    if(isNaN(value) || value < 0 || value > 100) {
                        throw new StatusError(422, `Course grade must be a number between 0 and 100 inclusive. ${value} is invalid.`);
                    }
                }

                if(values.length){
                    query += ',';
                }

                query += ` ${col}=?`;

                values.push(value);
            }
        });

        if(!values.length){
            throw new StatusError(400, 'No valid fields received to update');
        }

        query += ' WHERE id=?';
        values.push(record.id);

        const [result] = await db.execute(query, values);

        if(!result.affectedRows){
            throw new StatusError(500, 'Error updating student grade record');
        }

        const [[updatedRecord]] = await db.query('SELECT pid, course, grade, name, updated AS lastUpdated FROM grades WHERE id=?', [record.id]);
        
        res.send({
            message: `Updated grade record for ${updatedRecord.name}`,
            record: updatedRecord
        });
    } catch(error) {
        next(error);
    }
});

app.delete('/api/grades/:record_pid', async (req, res, next) => {
    try {
        const { record_pid } = req.params;

        const [result] = await db.execute('DELETE FROM grades WHERE pid=?', [record_pid]);

        if(!result.affectedRows){
            throw new StatusError(404, `No record found with an ID of: ${record_pid}`);
        }

        res.send({
            message: `Successfully deleted grade record: ${record_pid}`,
            deletedPid: record_pid
        });
    } catch(error) {
        next(error);
    }
});

app.use(defaultErrorHandler);

app.listen(PORT, () => {
    console.log('Server listening at localhost:' + PORT);
});
