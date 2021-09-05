const awilix = require("awilix");
const userService = require("./userService");
const currencyService = require("./currencyService");
const telegramApiService = require("./telegramApiService");
const notificationService = require("./notificationService");

module.exports = (container) => {
    container.register({
        userService: awilix.asFunction(userService),
        currencyService: awilix.asFunction(currencyService),
        telegramApiService: awilix.asFunction(telegramApiService),
        notificationService: awilix.asFunction(notificationService),
    });
}
