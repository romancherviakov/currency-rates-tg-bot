const { isEmpty } = require("lodash");
const isArray = require("lodash/isArray")
const MONOBANK_CURRENCY_RATES_URI = 'https://api.monobank.ua/bank/currency';
const NATIONAL_BANK_RATES_URI = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
const monobankCurrencyCodes = {
    'USD': 840,
    'EUR': 978,
    'UAH': 980
}
const { setupCache } = require("axios-cache-adapter");

module.exports = function({logger, axios}) {

    const getRequest = async function(url) {
        const cache = setupCache({ maxAge: 15 * 60 * 1000 });
        const api = axios.create({ adapter: cache.adapter});
        const length = await cache.store.length();
        console.log('Cache store length:', length);
        return api({ url, method: 'get'});
    }

    return {
        getMonobankCurrencyRates: async function() {
            let currencyRates = [];
            let response;
            logger.info('Sending monobank get currency request...');
            try {
                response = await getRequest(MONOBANK_CURRENCY_RATES_URI);
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
        },

        getNationalBankCurrencyRates: async function() {
            let currencyRates = [];
            let response;
            logger.info('Sending national bank get currency request...');
            try {
                response = await getRequest(NATIONAL_BANK_RATES_URI);
            } catch(err) {
                logger.error('Unable to receive national bank rates: ' + err.message);
                return currencyRates;
            }

            if (isArray(response.data)) {
                for (const item of response.data) {
                    if (item.cc === 'USD') {
                        currencyRates.push({
                            currency: 'USD',
                            sell: item.rate,
                            buy: '-'
                        });
                    }

                    if (item.cc === 'EUR') {
                        currencyRates.push({
                            currency: 'EUR',
                            sell: item.rate,
                            buy: '-'
                        });
                    }
                }
            }

            return currencyRates;
        }
    }
}