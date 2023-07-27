module.exports = function(db) {
    return {
        createUserIfNotExists: async function(userData) {
            let user = await db.User.findOne({ where: { chatId: userData.chatId } });
            if (!user) {
                user = await db.User.create(userData);
            }
            return user;
        },
        createUserFromRequest: async function(requestData) {
            return this.createUserIfNotExists({
                chatId: requestData.message.from.id,
                firstName: requestData.message.from.first_name,
                lastName: requestData.message.from.last_name
            });
        },
        getAllUsers: async function() {
            return db.User.findAll();
        }
    }
}
