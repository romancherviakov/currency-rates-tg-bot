const {
    NATIONAL_BANK_TITLE,
    PRIVAT_BANK_TITLE,
    MONOBANK_TITLE,
    PRIVAT_BANK_CARD_TITLE,
    UKRSIB_BANK_TITLE
} = require("../constants");

module.exports = function ({monobank, privat, privatCard, ukrsib, nbu}) {
    return {
        getAllCurrencyRates: async function () {
            let [
                nationalBankRates,
                monobankRates,
                privatBankRates,
                privatbankCardRates,
                ukrSibBankRates,
            ] = await Promise.all([
                nbu.getTodayRates(),
                monobank.getTodayRates(),
                privat.getTodayRates(),
                privatCard.getTodayRates(),
                ukrsib.getTodayRates(),
            ]);

            return [
                {'title': NATIONAL_BANK_TITLE, 'rates': nationalBankRates},
                {'title': MONOBANK_TITLE, 'rates': monobankRates},
                {'title': PRIVAT_BANK_TITLE, 'rates': privatBankRates},
                {'title': PRIVAT_BANK_CARD_TITLE, 'rates': privatbankCardRates},
                {'title': UKRSIB_BANK_TITLE, 'rates': ukrSibBankRates},
            ];
        }
    }
}
