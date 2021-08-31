const isEmpty = require("lodash/isEmpty");

module.exports = function({userService}) {
    return {
        callbackAction: async (req, res) => {
            let body = req.body;
            console.log("Received callback request");
            console.log(body);

            if (
                !isEmpty(body.message)
                && !isEmpty(body.message.text)
                && body.message.text == "/start"
            ) {
                let userData = {
                    chatId: body.message.from.id,
                    firstName: body.message.from.first_name,
                    lastName: body.message.from.last_name
                };

                let user = await userService.createUser(userData);

                console.log(`Subsribed new user to notifications, ID: ${user.id}`);
            }


            res.send({status: 200})
        }
    }
}