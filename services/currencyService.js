const { isEmpty } = require("lodash");
const isArray = require("lodash/isArray")
const MONOBANK_CURRENCY_RATES_URI = 'https://api.monobank.ua/bank/currency';
const NATIONAL_BANK_RATES_URI = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
const PRIVAT_BANK_RATES_URI = 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5';
const PRIVAT_BANK_CARD_RATES_URI = 'https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11';
const UKRSIB_CURRENCY_PAGE_URI = 'https://my.ukrsibbank.com/ua/personal/operations/currency_exchange/';
const { parse } = require('node-html-parser');
const monobankCurrencyCodes = {
    'USD': 840,
    'EUR': 978,
    'UAH': 980
}
const CACHE_TTL_MINUTES = 10;
const moment = require("moment");
const { 
    NATIONAL_BANK_TITLE,
    PRIVAT_BANK_TITLE,
    MONOBANK_TITLE,
    PRIVAT_BANK_CARD_TITLE,
    MISSING_RATE_VALUE,
    UKRSIB_BANK_TITLE
} = require("../constants");
const e = require("express");

let monobankCurrencyRatesCached = {};
let ukrSibBankCurrencyRatesCached = {};

module.exports = function({logger, axios}) {
    return {
        getAllCurrencyRates: async function() {
            let ratesCollection = [];
            let [ 
                nationalBankRates,
                monobankRates,
                privatBankRates,
                privatbankCardRates,
                ukrSibBankRates
            ] = await Promise.all([
                this.getNationalBankCurrencyRates(),
                this.getMonobankCurrencyRatesCached(),
                this.getPrivatBankRates(),
                this.getPrivatBankRatesCard(),
                this.getUkrSibCurrencyRatesCached(),
            ]);

            if (!isEmpty(nationalBankRates)) {
                ratesCollection.push({ 'title': NATIONAL_BANK_TITLE, 'rates': nationalBankRates });
            }

            if (!isEmpty(monobankRates)) {
                ratesCollection.push({ 'title': MONOBANK_TITLE, 'rates': monobankRates });
            }

            if (!isEmpty(privatBankRates)) {
                ratesCollection.push({ 'title': PRIVAT_BANK_TITLE, 'rates': privatBankRates });
            }

            if (!isEmpty(privatbankCardRates)) {
                ratesCollection.push({ 'title': PRIVAT_BANK_CARD_TITLE, 'rates': privatbankCardRates });
            }

            if (!isEmpty(ukrSibBankRates)) {
                ratesCollection.push({'title': UKRSIB_BANK_TITLE, 'rates': ukrSibBankRates})
            }

            if(isEmpty(ratesCollection)) {
                throw new Error(`Unable to receive any rates`);
            }

            return ratesCollection;
        },

        getUkrSibCurrencyRates: async function() {
            logger.info('Sending UkrSib currency page request...');
            try {
                let response = await  axios.get(UKRSIB_CURRENCY_PAGE_URI);
                let root = parse(response.data);
                let usdBuy = root.querySelector('.currency__table > tbody').childNodes[1].childNodes[3].childNodes[1].innerText;
                let usdSell = root.querySelector('.currency__table > tbody').childNodes[1].childNodes[5].childNodes[1].innerText;
                let eurBuy = root.querySelector('.currency__table > tbody').childNodes[3].childNodes[3].childNodes[1].innerText;
                let eurSell = root.querySelector('.currency__table > tbody').childNodes[3].childNodes[5].childNodes[1].innerText;

                return [{
                    currency: 'USD',
                    sell: usdSell,
                    buy: usdBuy,
                }, {
                    currency: 'EUR',
                    sell: eurSell,
                    buy: eurBuy,
                }];
            } catch (err) {
                logger.error(`Unable to receive ukrsib currency page ${err.message}`);
            }

            return [];
        },

        getUkrSibCurrencyRatesCached: async function() {
            logger.info('Reading ukr sib bank currencies from cache...');
            let now = moment();
            if (isEmpty(ukrSibBankCurrencyRatesCached)) {
                let rates = await this.getUkrSibCurrencyRates();
                ukrSibBankCurrencyRatesCached = {
                    rates,
                    time: moment(),
                }
            }

            let cacheTime = ukrSibBankCurrencyRatesCached.time;
            let duration = moment.duration(cacheTime.diff(now));
            if (duration.asMinutes() > CACHE_TTL_MINUTES) {
                logger.info('UkrSib bank currencies cache expired');
                let rates = await this.getUkrSibCurrencyRates();
                ukrSibBankCurrencyRatesCached = {
                    rates,
                    time: moment(),
                }
            }

            return ukrSibBankCurrencyRatesCached.rates;
        },

        getMonobankCurrencyRatesCached: async function() {
            logger.info('Reading monobank currencies from cache...');
            let now = moment();
            if (isEmpty(monobankCurrencyRatesCached)) {
                let rates = await this.getMonobankCurrencyRates();
                monobankCurrencyRatesCached = {
                    rates,
                    time: moment(),
                }
            }

            let cacheTime = monobankCurrencyRatesCached.time;
            let duration = moment.duration(cacheTime.diff(now));
            if (duration.asMinutes() > CACHE_TTL_MINUTES) {
                logger.info('Monobank currencies cache expired');
                let rates = await getMonobankCurrencyRates();
                monobankCurrencyRatesCached = {
                    rates,
                    time: moment(),
                }
            }

            return monobankCurrencyRatesCached.rates;
        },

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
        },

        getNationalBankCurrencyRates: async function() {
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
                    if (item.cc === 'USD') {
                        currencyRates.push({
                            currency: 'USD',
                            sell: item.rate,
                            buy: MISSING_RATE_VALUE,
                        });
                    }

                    if (item.cc === 'EUR') {
                        currencyRates.push({
                            currency: 'EUR',
                            sell: item.rate,
                            buy: MISSING_RATE_VALUE,
                        });
                    }
                }
            }

            return currencyRates;
        },

        getPrivatBankRates: async function() {
            logger.info('Reading privat bank currencies...');
            try {
                return this._privateBankApiCall(PRIVAT_BANK_RATES_URI);
            } catch(err) {
                logger.error('Unable to receive privat bank rates: ' + err.message);
                return [];
            }
        },

        getPrivatBankRatesCard: async function() {
            logger.info('Reading privat bank card currencies...');
            try {
                return this._privateBankApiCall(PRIVAT_BANK_CARD_RATES_URI);
            } catch(err) {
                logger.error('Unable to receive privat bank rates: ' + err.message);
                return [];
            }
        },

        _privateBankApiCall: async function(uri) {
            let currencyRates = [];
            let response = await axios.get(PRIVAT_BANK_RATES_URI);
        
            if (isArray(response.data)) {
                for (const item of response.data) {
                    if (item.ccy === 'USD') {
                        currencyRates.push({
                            currency: 'USD',
                            sell: item.sale,
                            buy: item.buy,
                        });
                    }

                    if (item.ccy === 'EUR') {
                        currencyRates.push({
                            currency: 'EUR',
                            sell: item.sale,
                            buy: item.buy,
                        });
                    }
                }
            }

            return currencyRates;
        }
    }
}