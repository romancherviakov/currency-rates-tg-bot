require('dotenv').config();
const Awilix = require('awilix');
const logger = require("./utils/loggerFactory")();
const db = require("./models");
const container = Awilix.createContainer({ injectionMode: Awilix.InjectionMode.PROXY });

container.register({
    axios: Awilix.asValue(require("axios")),
    logger: Awilix.asValue(logger),
    db: Awilix.asValue(db),
});

require("./controllers")(container);
require("./services")(container);

const express = require("express");
const app = express();
app.use(express.json());
app.get('/_health', (req, res) => container.resolve('healthController').indexAction(req,res));
app.post('/callback', (req,res) => container.resolve('callbackController').callbackAction(req, res));
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
    db.sequelize.close().then(() => {
      process.exit(0);
    });
  });
}
