const awilix = require("awilix");
const userService = require("./../services/userService");

module.exports = (container) => {
    container.register({
        userService: awilix.asFunction(userService),
    });

    return container;
}
