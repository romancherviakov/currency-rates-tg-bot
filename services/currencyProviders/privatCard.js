const PRIVAT_BANK_CARD_RATES_URI = 'https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11';

module.exports = ({axios, logger}) => {
    return {
        getTodayRates: () => {
            let currencyRates = [];
            logger.info('Reading privat bank currencies...');
            try {
                let response = await axios.get(PRIVAT_BANK_CARD_RATES_URI);
            
                if (isArray(response.data)) {
                    for (const item of response.data) {
                        if (['USD', 'EUR'].includes(item.ccy)) {
                            currencyRates.push({
                                currency: itemm.ccy,
                                sell: item.sale,
                                buy: item.buy,
                            });
                        }
                    }
                }
            } catch(err) {
                logger.error('Unable to receive privat bank rates: ' + err.message);
                return [];
            }
            
            return currencyRates;
        }
    }
};
