import dotenv from 'dotenv';
import express from 'express';
import * as Awilix from 'awilix';

dotenv.config();

const container = Awilix.createContainer({ injectionMode: Awilix.InjectionMode.PROXY });

require("./serviceProviders/loggerServiceProvider")(container);
require("./serviceProviders/axiosServiceProvider")(container);
require("./serviceProviders/controllerServiceProvider")(container);
require("./serviceProviders/databaseServiceProvider")(container);
require("./serviceProviders/currencyServiceProvider")(container);
require("./serviceProviders/notificationServiceProvider")(container);
require("./serviceProviders/telegramApiServiceProvider")(container);
require("./serviceProviders/userServiceProvider")(container);


const app = express();
app.use(express.json());
app.get('/_health', (req, res) => container.resolve('healthController').indexAction(req,res));
app.post('/callback', (req,res) => container.resolve('callbackController').callbackAction(req, res));


const logger = container.resolve('logger');
const server = app.listen(process.env.EXPRESS_PORT, () => {
    logger.info(`Started server...`);
    const schedulerTime = container.resolve('notificationService').startNotificationScheduler();
    logger.info('Started notification scheduler with time', schedulerTime);
});

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
        const db = container.resolve('db');
        db.sequelize.close().then(() => {
            process.exit(0);
        });
    });
}
