const UKRSIB_CURRENCY_PAGE_URI = 'https://my.ukrsibbank.com/ua/personal/operations/currency_exchange/';
const selectorPath = '.currency__table > tbody';
const { parse } = require('node-html-parser');

module.exports = ({logger, axios}) => {
    return {
        getTodayRates: () => {
            logger.info('Sending UkrSib currency page request...');
            try {
                let response = await  axios.get(UKRSIB_CURRENCY_PAGE_URI);
                let root = parse(response.data);
                let usdBuy = root.querySelector(selectorPath).childNodes[1].childNodes[3].childNodes[1].innerText;
                let usdSell = root.querySelector(selectorPath).childNodes[1].childNodes[5].childNodes[1].innerText;
                let eurBuy = root.querySelector(selectorPath).childNodes[3].childNodes[3].childNodes[1].innerText;
                let eurSell = root.querySelector(selectorPath).childNodes[3].childNodes[5].childNodes[1].innerText;

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
        }
    };
};
