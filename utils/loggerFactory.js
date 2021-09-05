const winston = require("winston");

module.exports  = () => {
    return winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        transports: [
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/combined.log' }),
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            })
        ],
    });
};
