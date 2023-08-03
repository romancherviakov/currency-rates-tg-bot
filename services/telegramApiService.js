const moment = require('moment');
const currencyService = require("./currencyService");
const { 
    NBU,
    PRIVAT,
    MONOBANK,
    PRIVAT_CARD,
    MISSING_RATE_VALUE,
    UKRSIB,
} = require("../constants");
const titles = {
    [MONOBANK]: "Монобанк",
    [NBU]: "Національний банк України",
    "rates_not_found": "Не вдалось отримати дані. Спробуйте пізніше",
    [PRIVAT]: 'Приват банк у відділеннях',
    [PRIVAT_CARD]: 'Приват банк безготівкові операції',
    [UKRSIB]: 'Укрсіб курс у кассах',
};
const telegramSendMessageAPI = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
const { isNumber } = require("lodash");

module.exports = function(logger, axios) {
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
        let message = `Курс валют у банках 💰🇺🇦 станом на ${moment().format('DD/MM/YYYY hh:mm')} \n\n`;
        for (const rateCollection of ratesCollections) {
            message += "<i>" + titles[rateCollection.title] + "</i>:\n";
            for (const rate of rateCollection.rates) {
                let currencyEmoji = '';

                if (rate.currency === 'USD') {
                    currencyEmoji = '💲';
                } else if (rate.currency === 'EUR') {
                    currencyEmoji = '💶';
                } 

                message+= `${rate.currency} ${currencyEmoji} продаж: <b>${formatRateValue(rate.sell)} грн.</b>, купівля: <b>${formatRateValue(rate.buy)} грн.</b>\n`;
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
    return value === MISSING_RATE_VALUE ? value : roundTwoDecimals(value);
}

function roundTwoDecimals(value) {
    return Math.round(value * 100) / 100;
}
