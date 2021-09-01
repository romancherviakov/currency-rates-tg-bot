const moment = require('moment');
const titles = {
    "monobank": "Монобанк",
};

module.exports = function({logger, axios}) {
    const sendTelegramMessage = async function(chatId, message) {
        let telegramSendMessageAPI = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        let res = await axios.get(telegramSendMessageAPI, {
            params: {
                chat_id: chatId,
                text: message
            }
        });

        return res;
    }

    return {
        notifyByChatId: async function(chatId, ratesCollections) {
            logger.info(`Notifying user by chat id: ${chatId}`);
            let message = prepareMessage(ratesCollections);
            await sendTelegramMessage(chatId, message);
        },
        sendIntroMessage: async function(chatId) {
            logger.info(`Welcome user by chat id: ${chatId}`);
            let message = "Я телеграм бот для отримання курсу валют.\n /rates - отримати актуальний курс";
            await sendTelegramMessage(chatId, message);
        }
    }
}

function prepareMessage(ratesCollections) {
    let title;
    let message = `Курс валют на сьогодні ${moment().format('MM/DD/YYYY')}: \n\n`;
    for (const rateCollection of ratesCollections) {
        title = titles[rateCollection.title];
        message += title + ":\n";
        for (const rate of rateCollection.rates) {
            message+= `${rate.currency} продаж: ${rate.sell}, купівля: ${rate.buy}\n`;
        }
        message += "\n";
    }

    return message;
}
