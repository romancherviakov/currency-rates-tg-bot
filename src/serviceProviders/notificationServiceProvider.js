const awilix = require("awilix");
const notificationService = require("./../services/notificationService");

module.exports = (container) => {
    container.register({
        notificationService: awilix.asFunction(notificationService),
    });

    return container;
}
