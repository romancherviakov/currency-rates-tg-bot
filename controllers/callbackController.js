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
    return {
        callbackAction: async (requestData) => {
            logger.info(`Received request data ${JSON.stringify(requestData)}`);
            if (isEmpty(requestData) || isEmpty(requestData.message) || isEmpty(requestData.message.text)) {
                logger.info('Ignoring callback request');
                return {status: 200};
            }

            if (constants.START_COMMAND === requestData.message.text) {
                let errors = checkUserDataValidator(requestData.message.from);
                if (!isEmpty(errors)) {
                    return {errors, status: 442};
                }

                let user = await userService.createUserIfNotExists({
                    chatId: requestData.message.from.id,
                    firstName: requestData.message.from.first_name,
                    lastName: requestData.message.from.last_name
                });

                logger.info('Subscribed user', user.toJSON());

                await telegramApiService.sendIntroMessage(requestData.message.from.id);
            }
            
            if (constants.GET_CURRENCY_RATES === requestData.message.text) {
                let errors = checkGetRatesDataValidator(requestData.message.from);
                if (!isEmpty(errors)) {
                    return {errors, status: 442};
                }

                let nationalBankRates = await currencyService.getNationalBankCurrencyRates();
                console.log(nationalBankRates);
                
                //await new Promise(resolve => setTimeout(resolve, 5000));
                let monobankRates = await currencyService.getMonobankCurrencyRates();
                console.log(monobankRates)

                if (isEmpty(monobankRates) || isEmpty(nationalBankRates)) {
                    await telegramApiService.notifyErrorMessageByChatId(requestData.message.from.id, "rates_not_found");

                    return {status: 404, message: "Rates not received"};
                }

                await telegramApiService.notifyByChatId(requestData.message.from.id, [
                    {
                        'title': 'monobank',
                        'rates': monobankRates,
                    },
                    {
                        'title': 'national_bank',
                        'rates': nationalBankRates,
                    }
                ]);
            }

            return {status: 200};
        }
    }
}
