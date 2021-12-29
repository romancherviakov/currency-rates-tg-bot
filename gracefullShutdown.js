module.exports = (container, server) => {
    const logger = container.resolve('logger');
    const db = container.resolve('db');

    process.on('SIGTERM', () => {
        logger.info('SIGTERM received');
        shutDownHandler();
    })
    
    process.on('uncaughtException', (err) => {
        logger.error('Shutting down application due Unhandled exception...');
        logger.error(err.message);
        logger.error(err.stack);
        shutDownHandler();
    });
    
    const shutDownHandler = function() {
        server.close(() => {
            db.sequelize.close().then(() => {
                process.exit(0);
            });
        });
    }
};
