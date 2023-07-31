const {
    NBU,
    PRIVAT,
    MONOBANK,
    PRIVAT_CARD,
    UKRSIB
} = require("../constants");
const isEmpty = require('lodash/isEmpty');
const CACHED_RATES = "CACHED_RATES";

module.exports = function (monobank, privat, privatCard, ukrsib, nbu, redisClient) {
    return {
        getAllCurrencyRates: async function () {
            let cachedRates = null;
            try  {
                cachedRates = await redisClient.get(CACHED_RATES);
            } catch(err) {
                console.log('Cache getting error: ' + err);
            }

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

            await redisClient.set(CACHED_RATES, JSON.stringify(ratesList), {EX: 3600, NX: true});

            return ratesList;
        }
    }
}
