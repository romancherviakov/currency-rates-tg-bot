require('dotenv').config();
const Awilix = require('awilix');

const container = Awilix.createContainer({ injectionMode: Awilix.InjectionMode.PROXY });
require("./serviceProviders")(container);

const express = require("express");
const app = express();
app.use(express.json());
require("./routing")(container, app);

const logger = container.resolve('logger');
const server = app.listen(process.env.EXPRESS_PORT, () => {
    logger.info(`Started server...`);
    const schedulerTime = container.resolve('notificationService').startNotificationScheduler();
    logger.info('Started notification scheduler with time', schedulerTime);
});

require("./gracefullShutdown")(container, server);
