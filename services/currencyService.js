const {
    NBU,
    PRIVAT,
    MONOBANK,
    PRIVAT_CARD,
    UKRSIB
} = require("../constants");
const isEmpty = require('lodash/isEmpty');

module.exports = function (monobank, privat, privatCard, ukrsib, nbu) {
    return {
        getAllCurrencyRates: async function () {
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

            return ratesList;
        }
    }
}
