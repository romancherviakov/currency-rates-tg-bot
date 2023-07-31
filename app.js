require('dotenv').config();

const express = require("express");
const { setup } = require("axios-cache-adapter");
const winston = require('winston');
const redis = require('redis');

let redisClient = null;

(async () => {
    redisClient = redis.createClient({url: process.env.REDIS_DSN});
    redisClient.on("error", (error) => console.error(`Error : ${error}`));
    await redisClient.connect();
})();

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

const axios = setup({ cache: { maxAge: 15 * 60 * 1000 }});
const db = require("./models");
const nbu = require("./services/currencyProviders/nbu")(logger, axios);
const monobank = require("./services/currencyProviders/monobank")(axios, logger, redisClient);
const privat = require("./services/currencyProviders/privat")(axios, logger);
const privatCard = require("./services/currencyProviders/privatCard")(axios, logger);
const ukrsib = require("./services/currencyProviders/ukrsib")(logger, axios);
const currencyService = require("./services/currencyService")(monobank, privat, privatCard, ukrsib, nbu, redisClient);
const userService = require("./services/userService")(db);
const telegramApiService = require("./services/telegramApiService")(logger, axios);
const notificationService = require("./services/notificationService")(userService, logger, telegramApiService);
const callbackController = require("./controllers/callbackController")(
    userService,
    logger,
    currencyService,
    telegramApiService
);
const healthController = require("./controllers/healthController")();

(async () => {
    let r = await currencyService.getAllCurrencyRates();
    console.log(r);
})();


const app = express();
app.use(express.json());
app.get('/_health', (req, res) => healthController.indexAction(req,res));
app.post('/callback', (req,res) => callbackController.callbackAction(req, res));


const server = app.listen(process.env.EXPRESS_PORT, () => {
    console.log('Express server started...');
    logger.info(`Started server...`);
    const schedulerTime = notificationService.startNotificationScheduler();
    logger.info('Started notification scheduler with time', schedulerTime);
});

const shutDownHandler = function() {
    server.close(() => {
        redisClient.close();
        db.sequelize.close().then(() => {
            process.exit(0);
        });
    });
}

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
