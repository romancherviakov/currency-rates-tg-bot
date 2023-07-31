const {
    NBU,
    PRIVAT,
    MONOBANK,
    PRIVAT_CARD,
    UKRSIB
} = require("../constants");
const isEmpty = require('lodash/isEmpty');
const CACHED_RATES = "CACHED_RATES";

module.exports = function (monobank, privat, privatCard, ukrsib, nbu, redisClient, logger) {
    return {
        getAllCurrencyRates: async function () {
            try {
                const cachedRates = await redisClient.get(CACHED_RATES);

                if (cachedRates) {

                    return cachedRates;
                }

                let providersMap = {
                    [NBU]: nbu,
                    [UKRSIB]: ukrsib,
                    [PRIVAT_CARD]: privatCard,
                    [PRIVAT]: privat,
                    [MONOBANK]: monobank,
                };

                let ratesList = [];
                for (let title in providersMap) {
                    let rates = await providersMap[title].getTodayRates();
                    if (!isEmpty(rates)) {
                        ratesList.push({title,rates});
                    }
                }

                await redisClient.set(CACHED_RATES, JSON.stringify(ratesList), {
                    EX: 3600,
                    NX: true
                });

                return ratesList;
            } catch(err) {
                logger.error('Unable to get rates: ' + err);

                return [];
            }
        }
    }
}
