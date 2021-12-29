const loggerServiceProvider = require("./loggerServiceProvider");
const axiosServiceProvider = require("./axiosServiceProvider");
const controllerServiceProvider = require("./controllerServiceProvider");
const databaseServiceProvider = require("./databaseServiceProvider");
const currencyServiceProvider = require("./currencyServiceProvider");
const notificationServiceProvider = require("./notificationServiceProvider");
const telegramApiServiceProvider = require("./telegramApiServiceProvider");
const userServiceProvider = require("./userServiceProvider");


module.exports = (container) => {
    loggerServiceProvider(container);
    axiosServiceProvider(container);
    controllerServiceProvider(container);
    databaseServiceProvider(container);
    currencyServiceProvider(container);
    notificationServiceProvider(container);
    telegramApiServiceProvider(container);
    userServiceProvider(container);

    return container;
};
