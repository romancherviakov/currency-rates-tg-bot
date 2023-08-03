const UKRSIB_CURRENCY_PAGE_URI = 'https://ukrsibbank.com/currency-cash/';
const selectorPath = '.currency__table > tbody';
const { parse } = require('node-html-parser');

module.exports = (logger, axios) => {
    return {
        getTodayRates: async () => {
            logger.info('Sending UkrSib currency page request...');
            try {
                let response = await  axios.get(UKRSIB_CURRENCY_PAGE_URI);
                let root = parse(response.data);

                return [{
                    currency: 'USD',
                    sell: root.querySelector(selectorPath).childNodes[1].childNodes[5].childNodes[1].innerText,
                    buy: root.querySelector(selectorPath).childNodes[1].childNodes[3].childNodes[1].innerText,
                }, {
                    currency: 'EUR',
                    sell: root.querySelector(selectorPath).childNodes[3].childNodes[5].childNodes[1].innerText,
                    buy: root.querySelector(selectorPath).childNodes[3].childNodes[3].childNodes[1].innerText,
                }];
            } catch (err) {
                logger.error(`Unable to receive ukrsib currency page ${err.message}`);
            }

            return [];
        }
    };
};
