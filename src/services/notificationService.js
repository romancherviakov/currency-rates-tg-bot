const moment = require("moment");

const ratesSchedule = [
    '10:00',
];

module.exports = ({userService, logger, telegramApiService, currencyService}) => {
    const isTimeForNotification = () => {
        let now = moment().format('HH:mm');
        return ratesSchedule.includes(now)
    }

    return {
        startNotificationScheduler: () => {
            setInterval(async function() {
                try {
                    if (isTimeForNotification()) {
                        let users = await userService.getAllUsers();
                        let ratesCollection = await currencyService.getAllCurrencyRates();

                        await Promise.all(users.map(async (user) => {
                            await telegramApiService.notifyByChatId(user.chatId, ratesCollection);
                        }));
                    }
                } catch (err) {
                    logger.error(err.message);
                }
            }, 60*1000);

            return ratesSchedule;
        }
    }
}
