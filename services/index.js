const awilix = require("awilix");
const userService = require("./userService");
const currencyService = require("./currencyService");
const telegramApiService = require("./telegramApiService");
const notificationService = require("./notificationService");
const nbu = require("./currencyProviders/nbu");
const monobank = require("./currencyProviders/monobank");
const privat = require("./currencyProviders/privat");
const privatCard = require("./currencyProviders/privatCard");
const ukrsib = require("./currencyProviders/ukrsib");

module.exports = (container) => {
    container.register({
        nbu: awilix.asFunction(nbu),
        monobank: awilix.asFunction(monobank),
        privat: awilix.asFunction(privat),
        privatCard: awilix.asFunction(privatCard),
        ukrsib: awilix.asFunction(ukrsib),
        userService: awilix.asFunction(userService),
        currencyService: awilix.asFunction(currencyService),
        telegramApiService: awilix.asFunction(telegramApiService),
        notificationService: awilix.asFunction(notificationService),
    });
}
