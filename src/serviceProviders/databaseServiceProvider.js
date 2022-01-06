const db = require("./../models");
const Awilix = require("awilix");

module.exports = (container) => {
    container.register({
        db: Awilix.asValue(db),
    });

    return container;
};