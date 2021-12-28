const MONOBANK_CURRENCY_RATES_URI = 'https://api.monobank.ua/bank/currency';
const isArray = require("lodash/isArray");

const monobankCurrencyCodes = {
    'USD': 840,
    'EUR': 978,
    'UAH': 980
};

module.exports = ({axios, logger}) => {
    return {
        getTodayRates: async function() {
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
                    for(const currency of ['USD', 'EUR']) {
                        if (item.currencyCodeA === monobankCurrencyCodes[currency] && item.currencyCodeB === monobankCurrencyCodes['UAH']) {
                            currencyRates.push({
                                currency: currency,
                                sell: item.rateSell,
                                buy: item.rateBuy,
                            });
                        }
                    }
                }
            }

            return currencyRates;
        }
    }
};
