const { setup } = require("axios-cache-adapter");
const Awilix = require("awilix");
const axios = setup({
  cache: {
    maxAge: 15 * 60 * 1000
  }
});

module.exports = (container) => {
    container.register({
        axios: Awilix.asValue(axios),
    });

    return container;
};
