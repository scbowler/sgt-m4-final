module.exports = class StatusError extends Error {
    constructor(code = 500, errors = 'Internal Server Error'){
        let message = errors;

        if(Array.isArray(message)){
            message = errors[0];
        } else {
            errors = [message];
        }
        
        super(message);

        this.code = code;
        this.errors = errors;
    }
}
