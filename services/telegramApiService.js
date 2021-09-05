const moment = require('moment');
const currencyService = require("./currencyService");
const { NATIONAL_BANK_TITLE, PRIVAT_BANK_TITLE, MONOBANK_TITLE, PRIVAT_BANK_CARD_TITLE} = require("../constants");
const titles = {
    [MONOBANK_TITLE]: "Монобанк",
    [NATIONAL_BANK_TITLE]: "Національний банк України",
    "rates_not_found": "Не вдалось отримати дані. Спробуйте пізніше",
    [PRIVAT_BANK_TITLE]: 'Приват банк у відділеннях',
    [PRIVAT_BANK_CARD_TITLE]: 'Приват банк безготівкові операції',
};
const telegramSendMessageAPI = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
const { isNumber } = require("lodash");

module.exports = function({logger, axios}) {
    const sendTelegramMessage = async function(chatId, message) {
        try {
            await axios.get(telegramSendMessageAPI, {
                params: {
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'html'
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
                message+= `${rate.currency} продаж: <b>${formatRateValue(rate.sell)}</b>, купівля: <b>${formatRateValue(rate.buy)}</b>\n`;
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

function formatRateValue(value) {
    return isNumber(value) ? roundTwoDecimals(value) : value;
}

function roundTwoDecimals(value) {
    return Math.round(value * 100) / 100;
}
