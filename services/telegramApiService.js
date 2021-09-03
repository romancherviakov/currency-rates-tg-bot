const moment = require('moment');
const titles = {
    "monobank": "Монобанк",
    "national_bank": "Національний банк України",
    "rates_not_found": "Не вдалось отримати дані. Спробуйте пізніше",
    'privat_bank': 'Приват банк у відділеннях',
    'privat_bank_card': 'Приват банк безготівкові операції',
};
const telegramSendMessageAPI = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

module.exports = function({logger, axios}) {
    const sendTelegramMessage = async function(chatId, message) {
        try {
            await axios.get(telegramSendMessageAPI, {
                params: {
                    chat_id: chatId,
                    text: message
                }
            });
        } catch (err) {
            logger.error("Unable to sent message", err.message);
        }
    }

    const prepareMessage = function(ratesCollections) {
        let message = `Курс валют на сьогодні ${moment().format('DD/MM/YYYY')}: \n\n`;
        for (const rateCollection of ratesCollections) {
            message += titles[rateCollection.title] + ":\n";
            for (const rate of rateCollection.rates) {
                message+= `${rate.currency} продаж: ${rate.sell}, купівля: ${rate.buy}\n`;
            }
            message += "\n";
        }
        return message;
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
        },
        notifyErrorMessageByChatId: async function(chatId, messageTitle) {
            let message = titles[messageTitle];
            logger.error(`Notifying chat id ${chatId} error: ${message}`);
            await sendTelegramMessage(chatId, message);
        }
    }
}
