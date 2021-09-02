module.exports = function({db}) {
    return {
        createUserIfNotExists: async function(userData) {
            let user = await db.User.findOne({ where: { chatId: userData.chatId } });
            if (!user) {
                user = await db.User.create(userData);
            }
            return user;
        }
    }
}
