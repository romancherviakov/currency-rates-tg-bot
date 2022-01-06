const callbackController = require("./../controllers/callbackController");
const healthController = require("./../controllers/healthController");
const awilix = require("awilix");

module.exports = (container) => {
    container.register({
        healthController: awilix.asFunction(healthController),
        callbackController: awilix.asFunction(callbackController)
    });

    return container;
}
