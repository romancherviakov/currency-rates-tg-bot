const awilix = require("awilix");
const winston = require("winston");

module.exports = (container) => {
    const logger = winston.createLogger({
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

    container.register({
        logger: awilix.asValue(logger),
    });

    return container;
}
