const StatusError = require('../helpers/status_error');

module.exports = (error, req, res) => {
    const output = {
        code: 500,
        errors: ['Internal Server Error'],
        message: `Bad ${req.method} Request`
    }
    
    if(error instanceof StatusError){
        output.code = error.code;
        output.errors = error.errors;
    }

    res.status(output.code).send(output);
}
