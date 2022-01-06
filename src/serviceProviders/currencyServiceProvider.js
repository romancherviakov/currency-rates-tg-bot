const nbu = require("./../services/currencyProviders/nbu");
const monobank = require("./../services/currencyProviders/monobank");
const privat = require("./../services/currencyProviders/privat");
const privatCard = require("./../services/currencyProviders/privatCard");
const ukrsib = require("./../services/currencyProviders/ukrsib");
const currencyService = require("./../services/currencyService");
const awilix = require("awilix");

module.exports = (container) => {
    container.register({
        nbu: awilix.asFunction(nbu),
        monobank: awilix.asFunction(monobank),
        privat: awilix.asFunction(privat),
        privatCard: awilix.asFunction(privatCard),
        ukrsib: awilix.asFunction(ukrsib),
        currencyService: awilix.asFunction(currencyService),
    });

    return container;
};
