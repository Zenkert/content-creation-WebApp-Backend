const winston = require('winston');
const morgan = require('morgan')
require('express-async-errors');

module.exports = function(app) {

    process.on('uncaughtException', (ex) => {
        console.log(ex);
        winston.error(ex.message, ex);
        process.exit(1);
    })

    process.on('unhandledRejection', ex => {
            throw ex
        }
    );

    winston.add(new winston.transports.File({ filename: 'logfile.log'}));
    winston.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize()
        )
    }))
    app.use(morgan('common'));

}