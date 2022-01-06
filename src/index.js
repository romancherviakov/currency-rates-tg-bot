"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const Awilix = __importStar(require("awilix"));
dotenv_1.default.config();
const container = Awilix.createContainer({ injectionMode: Awilix.InjectionMode.PROXY });
require("./serviceProviders/loggerServiceProvider")(container);
require("./serviceProviders/axiosServiceProvider")(container);
require("./serviceProviders/controllerServiceProvider")(container);
require("./serviceProviders/databaseServiceProvider")(container);
require("./serviceProviders/currencyServiceProvider")(container);
require("./serviceProviders/notificationServiceProvider")(container);
require("./serviceProviders/telegramApiServiceProvider")(container);
require("./serviceProviders/userServiceProvider")(container);
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/_health', (req, res) => container
    .resolve('healthController')
    .indexAction(req, res));
app.post('/callback', (req, res) => container
    .resolve('callbackController')
    .callbackAction(req, res));
const logger = container.resolve('logger');
const server = app.listen(process.env.EXPRESS_PORT, () => {
    logger.info(`Started server...`);
    const schedulerTime = container.resolve('notificationService').startNotificationScheduler();
    logger.info('Started notification scheduler with time', schedulerTime);
});
process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    shutDownHandler();
});
process.on('uncaughtException', (err) => {
    logger.error('Shutting down application due Unhandled exception...');
    logger.error(err.message);
    logger.error(err.stack);
    shutDownHandler();
});
const shutDownHandler = function () {
    server.close(() => {
        const db = container.resolve('db');
        db.sequelize.close().then(() => {
            process.exit(0);
        });
    });
};
//# sourceMappingURL=index.js.map