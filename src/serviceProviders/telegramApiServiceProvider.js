const awilix = require("awilix");
const telegramApiService = require("./../services/telegramApiService");

module.exports = (container) => {
    container.register({
        telegramApiService: awilix.asFunction(telegramApiService),
    });

    return container;
}
