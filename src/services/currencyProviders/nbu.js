const isArray = require("lodash/isArray");
const {MISSING_RATE_VALUE} = require("../../constants");
const NATIONAL_BANK_RATES_URI = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';

module.exports = ({logger, axios}) => {
    return {
        getTodayRates: async () => {
            let currencyRates = [];
            let response;
            logger.info('Sending national bank get currency request...');
            try {
                response = await axios.get(NATIONAL_BANK_RATES_URI);
            } catch(err) {
                logger.error('Unable to receive national bank rates: ' + err.message);
                return currencyRates;
            }

            if (isArray(response.data)) {
                for (const item of response.data) {
                    if (['USD', 'EUR'].includes(item.cc)) {
                        currencyRates.push({
                            currency: item.cc,
                            sell: item.rate,
                            buy: MISSING_RATE_VALUE,
                        });
                    }
                }
            }

            return currencyRates;
        }
    }
};
