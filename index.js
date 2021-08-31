require('dotenv').config();
const isEmpty = require("lodash/isEmpty");
const express = require("express");
const awilix = require('awilix');
const constants = require("./constants");

const healthController = require("./controllers/healthController");
const callbackController = require("./controllers/callbackController");

const userService = require("./services/userService");

const db = require("./models");

const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.PROXY
});
container.register({
    db: awilix.asValue(db),
    userService: awilix.asFunction(userService),
    healthController: awilix.asFunction(healthController),
    callbackController: awilix.asFunction(callbackController)
});

const app = express();
app.use(express.json());

const port = isEmpty(process.env.EXPRESS_PORT) ? constants.DEFAULT_EXPRESS_PORT : process.env.EXPRESS_PORT;


app.get('/_health', (req, res) => container.resolve('healthController').indexAction(req, res));
app.post('/callback', (req,res) => container.resolve('callbackController').callbackAction(req, res));

app.listen(port, () => console.log(`Started server on ${port} port`));