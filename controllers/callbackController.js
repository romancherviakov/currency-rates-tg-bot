const isEmpty = require("lodash/isEmpty");
const Validator = require("fastest-validator");
const constants = require('./../constants');
const v = new Validator();

const checkUserDataValidator = v.compile({
    id: { type: "number", positive: true, integer: true },
    first_name: { type: "string" },
    last_name: { type: "string" }
 });

 const checkGetRatesDataValidator = v.compile({
    id: { type: "number", positive: true, integer: true }
 });


module.exports = function({userService, logger, currencyService, telegramApiService}) {
    const handleValidationErrorResponse = (errors) => {
        logger.error('Unprocessable message data', {errors});
        res.send({status: 442, message: 'Validation error', errors});
        return;
    }

    return {
        callbackAction: async (req, res) => {
            let body = req.body;
            logger.info(`Received callback ${JSON.stringify(body)}`);
            console.log(body); // <- test

            if (isEmpty(body) || isEmpty(body.message) || isEmpty(body.message.text)) {
                logger.info('Ignoring callback request');
                res.send({status: 200});
                return;
            }

            let command = body.message.text;

            if (command === constants.START_COMMAND) {
                let errors = checkUserDataValidator(body.message.from);
                if (!isEmpty(errors)) {
                    return handleValidationErrorResponse(errors);
                }
                let user = await userService.subscribeUser({
                    chatId: body.message.from.id,
                    firstName: body.message.from.first_name,
                    lastName: body.message.from.last_name
                });
                logger.info('Subscribed user', user.toJSON());
                await telegramApiService.sendIntroMessage(body.message.from.id);
            }
            
            if (command === constants.GET_CURRENCY_RATES) {
                let errors = checkGetRatesDataValidator(body.message.from);
                if (!isEmpty(errors)) {
                    return handleValidationErrorResponse(errors);
                }
                let monobankRates = await currencyService.getMonobankCurrencyRates();
                await telegramApiService.notifyByChatId(body.message.from.id, [
                    {
                        'title': 'monobank',
                        'rates': monobankRates,
                    }
                ]);
            }

            res.send({status: 200})
        }
    }
}
