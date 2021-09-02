require('dotenv').config();
const isEmpty = require("lodash/isEmpty");
const express = require("express");
const awilix = require('awilix');
const constants = require("./constants");
const axios = require("axios");
const winston = require('winston');

const healthController = require("./controllers/healthController");
const callbackController = require("./controllers/callbackController");

const userService = require("./services/userService");
const db = require("./models");
const currencyService = require('./services/currencyService');
const telegramApiService = require('./services/telegramApiService');

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

const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY
});
container.register({
    axios: awilix.asValue(axios),
    logger: awilix.asValue(logger),
    db: awilix.asValue(db),
    userService: awilix.asFunction(userService),
    currencyService: awilix.asFunction(currencyService),
    telegramApiService: awilix.asFunction(telegramApiService),
    healthController: awilix.asFunction(healthController),
    callbackController: awilix.asFunction(callbackController)
});

const app = express();
app.use(express.json());

app.get('/_health', (req, res) => container.resolve('healthController').indexAction(req, res));
app.post('/callback', (req,res) => container.resolve('callbackController').callbackAction(req, res));

const port = isEmpty(process.env.EXPRESS_PORT) ? constants.DEFAULT_EXPRESS_PORT : process.env.EXPRESS_PORT;
const server = app.listen(port, () => console.log(`Started server on ${port} port`));

process.on('SIGTERM', () => {
  logger.error('Shutting down application...');
  server.close().then(() => {
    db.sequelize.close().then(() => {
      process.exit(0);
    });
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Shutting down application due Unhandled exception...');
  logger.error(err.message);
  logger.error(err.stack);
  server.close().then(() => {
    db.sequelize.close().then(() => {
      process.exit(0);
    });
  });
});
