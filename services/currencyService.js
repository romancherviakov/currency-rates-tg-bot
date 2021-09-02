const isArray = require("lodash/isArray")
const MONOBANK_CURRENCY_RATES_URI = 'https://api.monobank.ua/bank/currency';
const monobankCurrencyCodes = {
    'USD': 840,
    'EUR': 978,
    'UAH': 980
}

module.exports = function({logger, axios}) {
    return {
        getMonobankCurrencyRates: async function() {
            let currencyRates = [];
            let response;
            logger.info('Sending monobank get currency request...');
            try {
                response = await axios.get(MONOBANK_CURRENCY_RATES_URI);
            } catch(err) {
                logger.error('Unable to receive monobank rates: ' + err.message);
                return currencyRates;
            }

            if (isArray(response.data)) {
                for (const item of response.data) {
                    if (
                        item.currencyCodeA === monobankCurrencyCodes['USD'] 
                        && item.currencyCodeB === monobankCurrencyCodes['UAH']
                    ) {
                        currencyRates.push({
                            currency: 'USD',
                            sell: item.rateSell,
                            buy: item.rateBuy,
                        });
                    }

                    if (
                        item.currencyCodeA === monobankCurrencyCodes['EUR']
                        && item.currencyCodeB === monobankCurrencyCodes['UAH']
                    ) {
                        currencyRates.push({
                            currency: 'EUR',
                            sell: item.rateSell,
                            buy: item.rateBuy,
                        });
                    }
                }
            }

            return currencyRates;
        }
    }
}