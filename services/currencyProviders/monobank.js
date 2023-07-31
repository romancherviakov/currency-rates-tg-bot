const MONOBANK_CURRENCY_RATES_URI = 'https://api.monobank.ua/bank/currency';
const isArray = require("lodash/isArray");
const winston = require("winston");
const axios = require('axios');
const MONOBANK_CACHE_RATES = 'MONOBANK_CACHE_RATES';
const TTL_1_MINUTE = 60;

const monobankCurrencyCodes = {
    'USD': 840,
    'EUR': 978,
    'UAH': 980
};

/**
 * 
 * @param {axios.AxiosInstance} axios 
 * @param {winston.Logger} logger 
 */
module.exports = (axios, logger, redisClient) => {
    return {
        getTodayRates: async function() {

            const cachedCurrencyRates = await redisClient.get(MONOBANK_CACHE_RATES);

            if (cachedCurrencyRates) {
                return cachedCurrencyRates;
            }

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

            await redisClient.set(MONOBANK_CACHE_RATES, JSON.stringify(currencyRates), {
                EX: TTL_1_MINUTE,
                NX: true
            });

            return currencyRates;
        }
    }
};
