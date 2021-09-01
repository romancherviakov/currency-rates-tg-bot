const isEmpty = require("lodash/isEmpty");
const Validator = require("fastest-validator");
const constants = require('./../constants');

module.exports = function({userService, logger, currencyService, telegramApiService}) {
     const v = new Validator();
     const checkUserData = v.compile({
        id: { type: "number", positive: true, integer: true },
        first_name: { type: "string" },
        last_name: { type: "string" }
     });
     const checkGetRatesData = v.compile({
        id: { type: "number", positive: true, integer: true }
     });

    return {
        callbackAction: async (req, res) => {
            let body = req.body;
            logger.info(`Received callback ${JSON.stringify(body)}`);

            if (isEmpty(body) || isEmpty(body.message) || isEmpty(body.message.text)) {
                logger.info('Ignoring callback request');

                res.send({status: 200});
                return;
            }

            let command = body.message.text;

            if (command == constants.START_COMMAND) {
                let errors = checkUserData(body.message.from);
                if (!isEmpty(errors)) {
                    logger.error('Unprocessable message data', {errors});

                    res.send({status: 442, message: 'Validation error', errors});
                    return;
                }
                let user = await userService.subscribeUser({
                    chatId: body.message.from.id,
                    firstName: body.message.from.first_name,
                    lastName: body.message.from.last_name
                });
                logger.info('Subscribed user', user.toJSON());

                await telegramApiService.sendIntroMessage(body.message.from.id);
            }
            
            if (command == constants.GET_CURRENCY_RATES) {
                let errors = checkGetRatesData(body.message.from);
                if (!isEmpty(errors)) {
                    logger.error('Unprocessable message data', {errors});

                    res.send({status: 442, message: 'Validation error', errors});
                    return;
                }
                let monobankRates = await currencyService.getMonobankCurrencyRates();
                let ratesCollections = [
                    {
                        'title': 'monobank',
                        'rates': monobankRates,
                    }
                ];

                await telegramApiService.notifyByChatId(body.message.from.id, ratesCollections);
            }

            res.send({status: 200})
        }
    }
}
