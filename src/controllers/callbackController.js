const isEmpty = require("lodash/isEmpty");
const Validator = require("fastest-validator");
const v = new Validator();

const validationSchemas = {
    start: {
        id: { type: "number", positive: true, integer: true },
        first_name: { type: "string" },
        last_name: { type: "string" }
    },
    rates: {
        id: { type: "number", positive: true, integer: true }
    },
};

const START_COMMAND = '/start';
const GET_CURRENCY_RATES = '/rates';

module.exports = function({userService, logger, currencyService, telegramApiService}) {
    return {
        callbackAction: async (req, res) => {
            let requestData = req.body;
            logger.info(`Received request data ${JSON.stringify(requestData)}`);

            if (
                isEmpty(requestData) ||
                isEmpty(requestData.message) ||
                isEmpty(requestData.message.text)
            ) {
                logger.info('Ignoring callback request');
                return res.send({status: 200});
            }

            if (START_COMMAND === requestData.message.text) {
                let errors = v.compile(validationSchemas.start)(requestData.message.from);
                if (!isEmpty(errors)) {
                    return res.send({errors, status: 442});
                }

                let user = await userService.createUserFromRequest(requestData);
                logger.info('Subscribed user', user.toJSON());
                await telegramApiService.sendIntroMessage(requestData.message.from.id);
            }
            
            if (GET_CURRENCY_RATES === requestData.message.text) {
                let errors = v.compile(validationSchemas.rates)(requestData.message.from);
                if (!isEmpty(errors)) {
                    return res.send({errors, status: 442});
                }

                try {
                    let ratesCollection = await currencyService.getAllCurrencyRates();
                    await telegramApiService.notifyByChatId(requestData.message.from.id, ratesCollection);
                } catch (err) {
                    logger.error(err.message);
                    await telegramApiService.notifyErrorMessageByChatId(requestData.message.from.id, "rates_not_found");
                    return res.send({status: 404, message: "Rates not received"});
                }
            }

            return res.send({status: 200});
        }
    }
}
