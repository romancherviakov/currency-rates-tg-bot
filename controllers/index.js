const callbackController = require("./callbackController");
const healthController = require("./healthController");
const awilix = require("awilix");

module.exports = (container) => {
    container.register({
        healthController: awilix.asFunction(healthController),
        callbackController: awilix.asFunction(callbackController)
    });
}
